import axios from "axios";
import { Injectable, ForbiddenException, NotFoundException, InternalServerErrorException } from "@nestjs/common";

import { PrismaService } from '../prisma/prisma.service';
import { ProjectService } from '../project/project.service';
import { MilestoneService } from '../milestone/milestone.service';
import { TaskService } from '../task/task.service';


@Injectable()
export class AIService {
  
  private readonly API_URL ="https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";

  private readonly HF_API_KEY = process.env.HF_API_KEY;

  constructor(
    private prisma: PrismaService,
    private projectService: ProjectService,
    private milestoneService: MilestoneService,
    private taskService: TaskService,
  ) {}

  // Check if user has an AI-eligible package
  private async validatePackage(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { packageType: true },
    });
    

    if (!user || (user.packageType !== 'GOLD' && user.packageType !== 'DIAMOND')) {
      throw new ForbiddenException('AI features are available only for GOLD and DIAMOND users.');
    }
  }



  async assistProjectDetails(userId: string, projectData: { name: string; description: string }) {
    await this.validatePackage(userId);  // Ensure user has access

    const prompt = this.generatePrompt(projectData);
  
    try {
      const response = await axios.post(
        this.API_URL,
        { inputs: prompt },
        { headers: { Authorization: `Bearer ${this.HF_API_KEY}` } }
      );
  
      console.log("AI Raw Response:", response.data); // Debugging log
  
      const formattedResponse = this.formatAIResponse(response.data);
      console.log("Formatted AI Response:", formattedResponse); // Debugging log
  
      return formattedResponse;
    } catch (error) {
      console.error('Error calling AI:', error.response?.data || error.message);
      throw new Error('AI assistant failed to generate project details.');
    }
  }
  
  private generatePrompt(projectData: { name: string; description: string }): string {
    
    return `Project Name: ${projectData.name}
    
    Description: ${projectData.description}

    Based on this information, predict the following fields:
    - Type (e.g., Personal, Business, Startup)
    - VisionImpact (Summary of long-term goals and the impact of it)
    - Revenue Model (e.g., Freemium, Subscription, One-time Purchase)
    - Budget (Estimated range)
    - Timeline (Expected duration)
    - Team (e.g., Solo, Small Team, Large Team)
    - Visibility (Public or Private)
    - Location (Global, Regional, or Specific Country)
    - Status (Planning, In Progress, Completed)
    - Funding Source (e.g., Bootstrapped, Investors)
    - Tags (e.g., Mobile, Web, Education, Art, Freelancing)
    - Collaborations (Specify if you're open to working with others. If yes, mention the type of collaboration.)
    - CompletionDate ( refers to a date property that represents when a project is expected to finish. Think of it as a target deadline for the entire project, calculated based on milestones, tasks, and resource availability.)
    - MainGoal (the main goal of this project the propose of it exicet
    - StrategyModel (🚀 Learn Startup Best for: Entrepreneurs, startups, and makers launching new ideas.
        Focus: Rapid experimentation, minimal viable products (MVPs), and customer feedback loops.
        AI Role: Suggests quick iterations, prioritizes validation, and reduces waste.
        ⚡ Agile Sprint Best for: Teams or individuals working in short, focused development cycles.
        Focus: Breaking work into sprints, continuously improving with feedback.
        AI Role: Helps create sprint cycles, prioritize backlog items, and optimize workflow.
        🎯 MVP Focus Best for: Solo founders or small teams aiming to launch a Minimum Viable Product (MVP).
        Focus: Shipping a core product fast, with only the essential features.
        AI Role: Suggests feature priorities, helps remove unnecessary complexity, and keeps focus on launch.
        🛠 Custom PlanBest for: Users with unique needs who want a fully personalized implementation plan.
        Focus: User-defined workflow, deadlines, and milestones.
        AI Role: Assists in structuring the plan while giving full control to the user.
)
    Please ensure the response includes all the requested fields. 

    Respond in JSON format.`;
}


  formatAIResponse(responseData: any) {
    if (!responseData || !responseData[0] || !responseData[0].generated_text) {
      return { message: "AI could not generate structured details" };
    }
  
    const rawText = responseData[0].generated_text;
    console.log("Raw AI Text:", rawText); // Debugging log
  
    // Extract JSON from response (find the text between ``` and ``` or { and })
    const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : rawText.match(/{[\s\S]*}/)?.[0];
  
    if (!jsonString) {
      return { message: "AI could not generate structured details" };
    }
  
    try {
      const parsedJson = JSON.parse(jsonString);
      return parsedJson;
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return { message: "AI response could not be processed" };
    }
  }



  /*///////////////////////////////////////////////////////////////////////////////////////////////////////////*/


  async generateProjectRoadmap(
    userId: string,
    projectId: string,
    projectData: {
      name: string;
      description: string;
      type: string;
      visionImpact: string;
      revenueModel: string;
      budget: string;
      timeline: string;
      team: string;
      teamType: string;
      visibility: string;
      location: string;
      status: string;
      fundingSource: string;
      tags: string[];
      strategyModel: string;
      collaborations: string;
      MainGoal?: string;
    }
  ) {
    const prompt = this.createRoadmapPrompt(projectData);
    await this.validatePackage(userId);  // Ensure user has access

  
    try {
      console.log('=== AI PROMPT ===\n', prompt);
  
      const response = await axios.post(
        this.API_URL,
        {
          inputs: prompt,
          parameters: {
            temperature: 0.4,  // Lower for more focused responses
            max_length: 600,   // Reduced from 800
            wait_for_model: true,
            do_sample: true    // Add this parameter
          }
        },
        { 
          headers: { 
            Authorization: `Bearer ${this.HF_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 1800// 90 seconds timeout
        }
      );
  
      console.log('=== RAW AI RESPONSE ===\n', response.data);
      const roadmapText = response.data[0]?.generated_text || '';
      console.log('=== PROCESSED ROADMAP TEXT ===\n', roadmapText);
  
      const parsedRoadmap = this.parseRoadmap(roadmapText);
      console.log('=== PARSED ROADMAP ===\n', JSON.stringify(parsedRoadmap, null, 2));
  
      // Save roadmap to the database
      await this.saveRoadmapToDatabase(userId, projectId, parsedRoadmap);
  
      // Call AI updates for milestones and tasks AFTER saving the roadmap
      await this.updateMilestonesWithAI(userId, projectId);
      await this.updateTasksWithAI(userId, projectId);
      await this.suggestBestActionsWithAI(userId, projectId);
      await this.generateTaskSuggestionsWithAI(userId)

  
      return parsedRoadmap;
    } catch (error) {
      console.error('AI Error:', error);
      throw new Error('Failed to generate roadmap');
    }
  }
  
  
 

  

  private parseRoadmap(roadmapText: string): { milestones: { title: string; duration: string; tasks: string[] }[] } {
    const milestones: { title: string; duration: string; tasks: string[] }[] = [];
    const lines = roadmapText.split('\n');
    let currentMilestone: { title: string; duration: string; tasks: string[] } | null = null;
  
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
  
      // Detect milestones using "PHASE X: " pattern
      const phaseMatch = trimmed.match(/^PHASE\s+\d+:\s(.+)/i);
      if (phaseMatch) {
        if (currentMilestone) milestones.push(currentMilestone);
        currentMilestone = {
          title: phaseMatch[1].trim(),
          duration: '',
          tasks: []
        };
      }
      // Capture duration
      else if (trimmed.startsWith('⏳ Duration:')) {
        if (currentMilestone) {
          currentMilestone.duration = trimmed.split(':')[1].trim();
        }
      }
      // Capture tasks (key deliverables)
      else if (trimmed.startsWith('• ') && currentMilestone) {
        currentMilestone.tasks.push(trimmed.slice(2).trim());
      }
    });
  
    if (currentMilestone) milestones.push(currentMilestone);
    return { milestones };
  }
  
  private async saveRoadmapToDatabase(
    userId: string,
    projectId: string,
    parsedRoadmap: { milestones: { title: string; duration: string; tasks: string[] }[] }
  ) {
    let startDate = new Date();
    
    for (const milestoneData of parsedRoadmap.milestones) {
      // Calculate due date from duration
      const durationMatch = milestoneData.duration.match(/(\d+)/);
      const weeks = durationMatch ? parseInt(durationMatch[1]) : 2;
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + (weeks * 7));
  
      // Create milestone
      const milestone = await this.milestoneService.create(userId, {
        projectId,
        name: milestoneData.title,
        description: `AI-generated phase: ${milestoneData.title}`,
        status: 'not_started',
        startDate: startDate,
        dueDate: dueDate,
        priority: 'medium',
        aiGenerated: true,
        progress: 0,
        visibility: 'private',
      });
  
      // Create tasks
      for (const taskText of milestoneData.tasks) {
        await this.taskService.create(userId, {
          milestoneId: milestone.id,
          name: taskText,
          description: taskText,
          status: 'ON_HOLD',
          priority: 'MEDIUM',
          type: 'FEATURE',
          estimatedTime: this.estimateTaskTime(taskText)
        });
      }
  
      // Set next start date after current due date
      startDate = new Date(dueDate);
      startDate.setDate(startDate.getDate() + 1);
    }
  }
  
  private estimateTaskTime(taskText: string): number {
    // Simple estimation logic
    if (taskText.toLowerCase().includes('analysis')) return 8;  // 1 day
    if (taskText.toLowerCase().includes('deployment')) return 24; // 3 days
    return 16; // Default 2 days
  }
  

  
  private createRoadmapPrompt(projectData: any): string {
    const { name, type, description, strategyModel, teamType } = projectData;

    // Enhanced project-type configurations
    const projectConfig: Record<string, any> = {
        default: {
            terms: {
                mvp: 'MVP',
                launch: 'Launch',
                userFeedback: 'user interviews',
                validation: 'Market Validation',
                iteration: 'Product Iteration',
                delivery: 'Final Delivery'
            },
            team: ['Project Manager', 'Core Developer', 'QA Specialist'],
            risks: ['Market competition', 'Resource constraints', 'Technical challenges'],
            budget: {
                development: '40%',
                testing: '20%',
                marketing: '25%',
                contingency: '15%'
            }
        },
        software: {
            terms: {
                mvp: 'Minimum Viable Product',
                launch: 'Deployment',
                userFeedback: 'beta testing',
                validation: 'Feature Validation',
                iteration: 'Code Refinement',
                delivery: 'Production Release'
            },
            team: ['Tech Lead', 'UI/UX Designer', 'Full-stack Developer', 'DevOps Engineer'],
            risks: ['API reliability', 'Scalability issues', 'Security vulnerabilities'],
            budget: {
                development: '50%',
                testing: '25%',
                deployment: '15%',
                contingency: '10%'
            }
        },
        university: {
            terms: {
                mvp: 'Research Prototype',
                launch: 'Thesis Defense',
                userFeedback: 'peer reviews',
                validation: 'Academic Validation',
                iteration: 'Study Refinement',
                delivery: 'Final Publication'
            },
            team: ['Faculty Advisor', 'Research Lead', 'Data Analyst', 'Lab Technician'],
            risks: ['Funding limitations', 'Ethical approvals', 'Data collection challenges'],
            budget: {
                research: '35%',
                equipment: '30%',
                personnel: '25%',
                contingency: '10%'
            }
        },
        business: {
            terms: {
                mvp: 'Proof of Concept',
                launch: 'Market Entry',
                userFeedback: 'client trials',
                validation: 'Business Validation',
                iteration: 'Model Optimization',
                delivery: 'Full Operation'
            },
            team: ['CEO', 'Operations Manager', 'Marketing Lead', 'Sales Director'],
            risks: ['Market saturation', 'Regulatory changes', 'Supply chain issues'],
            budget: {
                product: '40%',
                marketing: '30%',
                operations: '20%',
                contingency: '10%'
            }
        }
    };

    // Enhanced strategy configurations
    const strategyConfig: Record<string, any> = {
        lean: {
            description: "User-Centric Validation Framework",
            phases: [
                { 
                    title: "🔍 ${validation}", 
                    tasks: [
                        "Conduct 5 ${userFeedback}",
                        "Develop ${mvp} concept",
                        "Competitive landscape analysis",
                        "User persona development"
                    ], 
                    duration: "2-3 weeks" 
                },
                { 
                    title: "🛠 Build-Test-Learn", 
                    tasks: [
                        "Create interactive ${mvp}",
                        "Implement analytics tracking",
                        "A/B test core features",
                        "Collect qualitative feedback"
                    ], 
                    duration: "3-4 weeks" 
                },
                { 
                    title: "🔄 ${iteration}", 
                    tasks: [
                        "Prioritize feature backlog",
                        "Optimize user experience",
                        "Update risk mitigation plan",
                        "Prepare scalability blueprint"
                    ], 
                    duration: "2-3 weeks" 
                },
                { 
                    title: "🚀 ${delivery}", 
                    tasks: [
                        "Final security audits",
                        "Launch marketing campaign",
                        "Establish user support system",
                        "Implement monitoring dashboard"
                    ], 
                    duration: "3-4 weeks" 
                }
            ]
        },
        academic: {
            description: "Research-Driven Development Framework",
            phases: [
                { 
                    title: "📚 Literature Review", 
                    tasks: [
                        "Conduct systematic review",
                        "Identify research gaps",
                        "Formulate hypothesis",
                        "Secure ethics approval"
                    ], 
                    duration: "3-4 weeks" 
                },
                { 
                    title: "🔬 Methodology Design", 
                    tasks: [
                        "Develop research framework",
                        "Create data collection tools",
                        "Pilot study implementation",
                        "Peer validation process"
                    ], 
                    duration: "4-6 weeks" 
                },
                { 
                    title: "📊 Data Analysis", 
                    tasks: [
                        "Process collected data",
                        "Statistical validation",
                        "Comparative analysis",
                        "Draft findings"
                    ], 
                    duration: "3-5 weeks" 
                },
                { 
                    title: "📝 Publication", 
                    tasks: [
                        "Final paper writing",
                        "Journal submission",
                        "Conference preparation",
                        "Knowledge transfer plan"
                    ], 
                    duration: "4-6 weeks" 
                }
            ]
        },
        default: {
            description: "Adaptive Success Framework",
            phases: [
                { 
                    title: "🎯 Strategic Foundation", 
                    tasks: [
                        "Stakeholder alignment workshop",
                        "SWOT analysis",
                        "Risk assessment matrix",
                        "Success metric definition"
                    ], 
                    duration: "2-3 weeks" 
                },
                { 
                    title: "🛠 Core Development", 
                    tasks: [
                        "Modular implementation",
                        "Quality assurance protocols",
                        "User feedback integration",
                        "Performance benchmarking"
                    ], 
                    duration: "4-8 weeks" 
                },
                { 
                    title: "📌 Validation & Refinement", 
                    tasks: [
                        "Pilot deployment",
                        "Data-driven optimization",
                        "Competitive analysis update",
                        "Resource reallocation"
                    ], 
                    duration: "3-4 weeks" 
                },
                { 
                    title: "🚀 Operational Excellence", 
                    tasks: [
                        "Full-scale deployment",
                        "Team training program",
                        "Long-term monitoring",
                        "Continuous improvement"
                    ], 
                    duration: "4-6 weeks" 
                }
            ]
        }
    };

    const config = projectConfig[type] || projectConfig.default;
    const selectedStrategy = strategyConfig[strategyModel] || strategyConfig.default;

    // Dynamic content processing
    const processedPhases = selectedStrategy.phases.map((phase: any) => ({
        ...phase,
        title: phase.title.replace(/\${(.*?)}/g, (_, key) => config.terms[key] || key),
        tasks: phase.tasks.map((task: string) => 
            task.replace(/\${(.*?)}/g, (_, key) => config.terms[key] || key)
        )
    }));

    // Calculate timeline
    const totalDuration = processedPhases.reduce((acc: number, phase: any) => {
        const weeks = parseInt(phase.duration.split('-')[0]);
        return acc + weeks;
    }, 0);

    // Build roadmap
    let roadmap = `🔷 STRATEGIC ROADMAP: ${name || 'Your Project'} 🔷\n\n`;
    roadmap += `🏷 Type: ${type || 'General'}\n`;
    roadmap += `📐 Strategy: ${selectedStrategy.description}\n`;
    roadmap += description ? `📝 Description: ${description}\n\n` : '\n';

    processedPhases.forEach((phase: any, index: number) => {
        roadmap += `PHASE ${index + 1}: ${phase.title}\n`;
        roadmap += `⏳ Duration: ${phase.duration}\n`;
        roadmap += `📦 Key Deliverables:\n${phase.tasks.map((t: string) => `• ${t}`).join('\n')}\n\n`;
    });

    roadmap += `📊 Success Ecosystem:\n`;
    roadmap += `• Real-time KPI dashboards\n• User satisfaction metrics\n• Innovation index tracking\n\n`;

    roadmap += `🛡 Risk Management:\n`;
    roadmap += `• ${config.risks.join('\n• ')}\n• Dynamic contingency planning\n\n`;

    if (teamType === 'team') {
      roadmap += `👥 Team Structure:\n`;
      roadmap += `• ${config.team.join('\n• ')}\n\n`;
  }


    roadmap += `💰 Budget Allocation:\n`;
    Object.entries(config.budget).forEach(([category, percentage]) => {
        roadmap += `• ${category}: ${percentage}\n`;
    });

    roadmap += `\n⏱ Estimated Timeline: ${totalDuration}-${totalDuration + 2} weeks`;

    return roadmap;
}



private parseDate(dateString: any, fallback: Date): Date {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? fallback : date;
}
async updateMilestonesWithAI(userId: string, projectId: string) { 
  await this.validatePackage(userId);  // Ensure user has access

  const milestones = await this.milestoneService.getByProject(userId, projectId);

  if (!milestones.length) {
    throw new NotFoundException('No milestones found for this project');
  }

  // Improved AI Prompt with Progress-Based Status
  const prompt = `Analyze the following milestones and return a JSON array where each object contains "title", "status" (not_started, in_progress, completed), and "priority" (low, medium, high). 
  - If progress is 100%, set status to "completed".  
  - If progress is between 1% and 99%, set status to "in_progress".  
  - If progress is 0%, set status to "not_started".  
  - "start_date" (ISO-8601 format estimated logical start date based on dependencies)
  - "due_date" (ISO-8601 format estimated logical due date considering task durations)

  Rules:
  - The first milestone should start at the project start date if available.
  - A milestone cannot start before the previous milestone ends.
  - If tasks have estimated durations, sum them up for due_date estimation.
  - Strictly return only JSON.\n\n` +
    milestones.map(m => `- Title: ${m.name}, Description: ${m.description}`).join("\n");


  // Call AI API
  const response = await axios.post(
    this.API_URL,
    { inputs: prompt, parameters: { temperature: 0.2, max_length: 500, return_full_text: false } },
    { headers: { Authorization: `Bearer ${this.HF_API_KEY}` }, timeout: 60000 }
  );

  // Extract AI Response
  const aiResponseText = response.data[0]?.generated_text || '';
  console.log("Raw AI Response:", aiResponseText);

  let jsonString = '';

  // Extract JSON from AI response
  const jsonMatch = aiResponseText.match(/```json\s*([\s\S]+?)\s*```/);
  if (jsonMatch) {
    jsonString = jsonMatch[1];
  } else {
    const firstBracket = aiResponseText.indexOf('[');
    const lastBracket = aiResponseText.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      jsonString = aiResponseText.substring(firstBracket, lastBracket + 1);
    } else {
      throw new InternalServerErrorException('AI response does not contain valid JSON.');
    }
  }

  let aiSuggestions;
  try {
    aiSuggestions = JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse AI response JSON:", jsonString);
    throw new InternalServerErrorException('AI response JSON is invalid.');
  }

  if (!Array.isArray(aiSuggestions)) {
    throw new InternalServerErrorException('AI response is not in array format.');
  }

  const updatedMilestones: { name: string; suggestedStatus: string; suggestedPriority: string ,startDate: string; dueDate: string}[] = [];

  
  // Ensure AI does not return all "Pending" by applying progress-based status
  for (const suggestion of aiSuggestions) {
    const milestone = milestones.find(m => m.name === suggestion.title);

    if (!milestone) {
      console.warn(`No matching milestone found for AI suggestion: ${suggestion.title}`);
      continue;
    }

    // Override AI response if needed based on actual progress
    let correctedStatus = suggestion.status;
    if (milestone.progress === 100) {
      correctedStatus = "completed";
    } else if (milestone.progress > 0) {
      correctedStatus = "in_progress";
    } else {
      correctedStatus = "not_started";
    }

    const currentDate = new Date();

    const startDate = milestone.startDate || suggestion.start_date || new Date().toISOString();
    const dueDate = suggestion.due_date || new Date(new Date(startDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();


    console.log(`Updating milestone: ${milestone.name}, Status: ${correctedStatus}, Priority: ${suggestion.priority}, Start Date: ${startDate}, Due Date: ${dueDate}`);

    await this.milestoneService.update(userId, milestone.id, {
      status: correctedStatus,
      priority: suggestion.priority
    });

    updatedMilestones.push({
      name: milestone.name,
      suggestedStatus: correctedStatus,
      suggestedPriority: suggestion.priority,
      startDate: startDate,
      dueDate: dueDate
    });
  }

  return {
    message: 'Milestones updated successfully with AI suggestions',
    updates: updatedMilestones
  };
}



async updateTasksWithAI(userId: string, projectId: string) { 
  await this.validatePackage(userId);  // Ensure user has access

  const tasks = await this.taskService.getTasksByProjectId(userId, projectId);

  if (!tasks.length) {
    throw new NotFoundException('No tasks found for this project');
  }

  // Improved AI Prompt
  const prompt = `Analyze the following tasks and return a JSON array where each object contains: 
  - "title" (same as given task title),  
  - "status"(not_started, in_progress, completed), 
  - "priority" (low, medium, high),  
  - "type" (e.g., Development, Marketing, Research, Design, etc.).  
  - If progress is 100%, set status to "completed".  
  - If progress is between 1% and 99%, set status to "in_progress".  
  - If progress is 0%, set status to "not_started".  
  
  - "start_date" (ISO-8601 format estimated logical start date based on dependencies)
  - "due_date" (ISO-8601 format estimated logical due date considering task durations)

  Rules:
  - The first task should start at the milestone start date if available.
  - A task cannot start before the previous task ends.
  - If tasks have estimated durations, sum them up for due_date estimation.
  - Strictly return only JSON.\n\n` +


    tasks.map(t => `- Title: ${t.name}, Description: ${t.description}, Progress: ${t.progress}`).join("\n");

  // Call AI API
  const response = await axios.post(
    this.API_URL,
    { inputs: prompt, parameters: { temperature: 0.2, max_length: 500, return_full_text: false } },
    { headers: { Authorization: `Bearer ${this.HF_API_KEY}` }, timeout: 60000 }
  );

  // Extract AI Response
  const aiResponseText = response.data[0]?.generated_text || '';
  console.log("Raw AI Response:", aiResponseText);

  let jsonString = '';

  // Extract JSON from AI response
  const jsonMatch = aiResponseText.match(/```json\s*([\s\S]+?)\s*```/);
  if (jsonMatch) {
    jsonString = jsonMatch[1];
  } else {
    const firstBracket = aiResponseText.indexOf('[');
    const lastBracket = aiResponseText.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      jsonString = aiResponseText.substring(firstBracket, lastBracket + 1);
    } else {
      throw new InternalServerErrorException('AI response does not contain valid JSON.');
    }
  }

  let aiSuggestions;
  try {
    aiSuggestions = JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse AI response JSON:", jsonString);
    throw new InternalServerErrorException('AI response JSON is invalid.');
  }

  if (!Array.isArray(aiSuggestions)) {
    throw new InternalServerErrorException('AI response is not in array format.');
  }

  const updatedTasks: { name: string; suggestedStatus: string; suggestedPriority: string; suggestedType: string }[] = [];

  // Ensure AI does not return incorrect statuses
  for (const suggestion of aiSuggestions) {
    const task = tasks.find(t => t.name === suggestion.title);

    if (!task) {
      console.warn(`No matching task found for AI suggestion: ${suggestion.title}`);
      continue;
    }

    // Override AI response if needed based on actual progress
    let correctedStatus = suggestion.status;
    if (task.progress === 100) {
      correctedStatus = "completed";
    } else if (task.progress > 0) {
      correctedStatus = "in_progress";
    } else {
      correctedStatus = "not_started";
    }
   
    const currentDate = new Date();

    let startDate = task.startDate 
      ? new Date(task.startDate)
      : this.parseDate(suggestion.start_date, currentDate);
      const defaultDueDate = new Date(startDate.getTime() + 14 * 86400000); // 14 days
      let dueDate = this.parseDate(suggestion.due_date, defaultDueDate);
      
      // Ensure due date is after start date
      if (dueDate < startDate) dueDate = defaultDueDate;
    console.log(`Updating task: ${task.name}, New Status: ${correctedStatus}, New Priority: ${suggestion.priority}, New Type: ${suggestion.type}`);

    await this.taskService.update(userId, task.id, {
      status: correctedStatus,
      priority: suggestion.priority,
      type: suggestion.type,
      startDate: startDate, // Convert Date to ISO 8601 string
      dueDate: dueDate
    });

    updatedTasks.push({
      name: task.name,
      suggestedStatus: correctedStatus,
      suggestedPriority: suggestion.priority,
      suggestedType: suggestion.type,
      
       
    });
  }

  return {
    message: 'Tasks updated successfully with AI suggestions',
    updates: updatedTasks
  };
}

async suggestBestActionsWithAI(userId: string, projectId: string) {
  await this.validatePackage(userId);  // Ensure user has access

  // Fetch project details (ensure project exists)
  const project = await this.prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundException('Project not found');
  }

  // Fetch tasks and milestones for the project
  const tasks = await this.taskService.getTasksByProjectId(userId, projectId);
  const milestones = await this.milestoneService.getByProject(userId, projectId);

  if (!tasks.length && !milestones.length) {
    throw new NotFoundException('No tasks or milestones found for this project');
  }

  // AI Prompt
  const prompt = `Based on the following milestones and tasks, generate the best action plan for the user. 
  - Consider due dates, priorities, and workload balance.
  - Suggest whether the user should continue a task, switch to another, or complete an urgent milestone.
  - Return JSON with "recommendation" (best action), "reason" (why it's the best choice), and "nextSteps" (what to do next).
  Strictly return only JSON.

  ` + milestones.map(m => `- Milestone: ${m.name}, Start: ${m.startDate}, Due: ${m.dueDate}, Priority: ${m.priority}, Progress: ${m.progress}`).join("\n") +
    "\n" +
    tasks.map(t => `- Task: ${t.name}, Start: ${t.startDate}, Due: ${t.dueDate}, Priority: ${t.priority}, Progress: ${t.progress}`).join("\n");

  // Call AI API
  const response = await axios.post(
    this.API_URL,
    { inputs: prompt, parameters: { temperature: 0.2, max_length: 500, return_full_text: false } },
    { headers: { Authorization: `Bearer ${this.HF_API_KEY}` }, timeout: 60000 }
  );

  // Extract AI Response
  const aiResponseText = response.data[0]?.generated_text || '';
  console.log("Raw AI Response:", aiResponseText);

  let jsonString = '';
  const jsonMatch = aiResponseText.match(/```json\s*([\s\S]+?)\s*```/);
  if (jsonMatch) {
    jsonString = jsonMatch[1];
  } else {
    const firstBracket = aiResponseText.indexOf('[');
    const lastBracket = aiResponseText.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      jsonString = aiResponseText.substring(firstBracket, lastBracket + 1);
    } else {
      throw new InternalServerErrorException('AI response does not contain valid JSON.');
    }
  }

  let aiSuggestions;
  try {
    aiSuggestions = JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse AI response JSON:", jsonString);
    throw new InternalServerErrorException('AI response JSON is invalid.');
  }

  // **Save AI Insights to Project**
  await this.prisma.project.update({
    where: { id: projectId },
    data: { aiInsights: JSON.stringify(aiSuggestions) }, // Save as string if using JSON field
  });

  return {
    message: 'AI-generated action plan saved to project',
    recommendations: aiSuggestions,
  };
}





async generateTaskSuggestionsWithAI(userId: string) {
  await this.validatePackage(userId);  // Ensure user has access

  const tasks = await this.taskService.getTasksByMemberId(userId);

  if (!tasks.length) {
    throw new NotFoundException('No tasks found for this user');
  }

  // Construct AI prompt
  const prompt = `Analyze the following tasks and provide personalized recommendations for each. 
For each task, return a JSON object with:
- "title" (exact task title)
- "bestAction" (specific next step)
- "timeAllocation" (suggested time in hours)
- "aiSuggestions" (efficiency recommendations)
- "aiTaskOptimization" (how to optimize the task for better efficiency)

Strictly return only a JSON array of objects:\n\n` +
tasks.map(t => 
  `Task: ${t.name}
Description: ${t.description}
Priority: ${t.priority || 'unset'}
Due: ${t.dueDate?.toISOString() || 'no deadline'}
Progress: ${t.progress}%`
).join("\n\n");

  // Call AI API
  const response = await axios.post(
    this.API_URL,
    { 
      inputs: prompt,
      parameters: { 
        temperature: 0.3,
        max_length: 1000,
        return_full_text: false
      }
    },
    { headers: { Authorization: `Bearer ${this.HF_API_KEY}` }, timeout: 60000 }
  );

  // Process AI response
  const aiResponseText = response.data[0]?.generated_text || '';
  console.log("AI Response:", aiResponseText);

  let jsonString = '';
  const jsonMatch = aiResponseText.match(/```json\s*([\s\S]+?)\s*```/);
  if (jsonMatch) {
    jsonString = jsonMatch[1];
  } else {
    const firstBracket = aiResponseText.indexOf('[');
    const lastBracket = aiResponseText.lastIndexOf(']');
    jsonString = firstBracket !== -1 && lastBracket > firstBracket 
      ? aiResponseText.slice(firstBracket, lastBracket + 1)
      : aiResponseText;
  }

  let aiSuggestions;
  try {
    aiSuggestions = JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON Parse Error:", error.message);
    throw new InternalServerErrorException('Invalid AI response format');
  }

  // Validate and update tasks with AI suggestions
  const updatedTasks = await Promise.all(aiSuggestions.map(async suggestion => {
    const task = tasks.find(t => t.name === suggestion.title);
    if (!task) {
      console.warn(`Suggestion for unknown task: ${suggestion.title}`);
      return null;
    }

    return this.taskService.update(userId,task.id, {
      bestAction: suggestion.bestAction || 'No suggestion',
      timeAllocation: `${suggestion.timeAllocation || 0} hours`,
      aiSuggestions: suggestion.aiSuggestions || 'No suggestions available',
      aiTaskOptimization: suggestion.aiTaskOptimization || 'No optimization suggestions',
    });
  }));

  return {
    message: 'AI-powered task suggestions saved',
    updatedTasks: updatedTasks.filter(Boolean), // Remove null values
    generatedAt: new Date().toISOString()
  };
}


/******************* */
// Improved generateDigitalProjectRoadmap function
async generateDigitalProjectRoadmap(userId, projectId) {
  try {
    // Get project data using the provided ID
    const projectData = await this.projectService.getById(userId, projectId);
    
    if (!projectData) {
      throw new Error("Project not found with ID: " + projectId);
    }
    
    // Extract relevant project information
    const { 
      name: projectName, 
      description: projectDescription, 
      tags, 
      estimatedCompletionDate,
      timeline,
      type,
      teamType,
      mainGoal
    } = projectData;
    
    // Validate essential project data
    if (!projectName || !projectDescription) {
      throw new Error("Project name or description missing.");
    }
    
    // Handle date properly
    const projectEndDate = estimatedCompletionDate ? new Date(estimatedCompletionDate) : new Date();
    const currentDate = new Date();
    const projectDurationDays = Math.ceil((projectEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Extract unique aspects from description and tags
    const keyFeatures = this.extractKeyFeatures(projectDescription, tags);
    const targetAudience = this.extractTargetAudience(projectDescription);
    
    // Format project tags for prompt
    const tagsFormatted = tags && tags.length > 0 
      ? `Project Tags: ${tags.join(', ')}`
      : 'No tags specified';
    
    // Create a more personalized and detailed prompt for the AI
    const prompt = `
I need a truly personalized, innovative roadmap for this specific digital project:

📋 Project Details:
- Project Name: ${projectName}
- Description: ${projectDescription}
- ${tagsFormatted}
- Timeline: ${timeline || `${projectDurationDays} days`}
- Project Type: ${type}
- Team Structure: ${teamType}
- Main Goal: ${mainGoal || "Not specified"}

## Key Project Elements:
- Target Audience: ${targetAudience || "Small business owners with limited technical expertise"}
- Main Features: ${(await keyFeatures).join(', ')}

Please create a DEEPLY PERSONALIZED roadmap with innovative milestones and tasks specific to ${projectName}. This is a ${teamType} project focused on ${tags && tags.length > 0 ? tags.join(', ') : 'digital work'}.

Your roadmap must be UNIQUELY TAILORED to this specific project and include:

1. Strategic milestones (5-8) that reflect the actual unique aspects of THIS project
2. For each milestone, create specific tasks with clear descriptions that directly reference the project's features
3. Use the actual project timeline of ${projectDurationDays} days starting today
4. Include specific technologies mentioned in the project tags when appropriate
5. Add at least 2 truly innovative ideas or approaches specific to this project's goals
6. Specify dependencies between tasks where relevant

DO NOT use generic template language or standard project phases. Every element must be specific to ${projectName} and its unique features/requirements.

Requirements for each milestone:
- name: Unique, specific title directly related to this project
- description: Detailed explanation showing understanding of this specific project's goals
- status: Always "planned"
- startDate: In YYYY-MM-DD format
- dueDate: In YYYY-MM-DD format
- priority: Either "high", "medium", or "low" based on project needs

Requirements for each task:
- name: Specific, actionable task name referencing actual project elements
- description: Detailed explanation with project-specific details
- status: Always "to do"
- startDate: In YYYY-MM-DD format  
- dueDate: In YYYY-MM-DD format
- priority: Either "high", "medium", or "low"

Format your response with clearly labeled Milestones and numbered Tasks under each milestone.
`;

    console.log("Sending request to OpenRouter API with improved prompt...");
    
    // Make the API request to Claude instead of DeepSeek
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "openai/gpt-4-turbo", // Using Claude for better personalization and reasoning
        messages: [
          {
            role: 'system',
            content: `You are an expert digital project manager specializing in creating HIGHLY PERSONALIZED, creative, and practical roadmaps for digital projects. You avoid generic templates and corporate jargon. Instead, you provide thoughtful, tailored planning that demonstrates critical thinking and understanding of the specific project at hand. Think deeply about each project's unique requirements, technologies, and goals before creating milestones and tasks.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY2}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log("Response received from OpenRouter API");
    
    // Add detailed logging to inspect the API response
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));
    
    // More robust response handling
    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error("Invalid response structure from OpenRouter API. Response: " + JSON.stringify(response.data));
    }
    
    const messageContent = response.data.choices[0].message?.content;
    
    if (!messageContent) {
      throw new Error("No content in response message. Full response: " + JSON.stringify(response.data));
    }
    
    const roadmapContent = messageContent.trim();
    
    if (!roadmapContent || roadmapContent.length < 10) {
      throw new Error("Empty or very short roadmap content received: " + roadmapContent);
    }
    
    console.log("Roadmap content received, length:", roadmapContent.length);
    
    // Parse and structure the roadmap data using improved parser
    const structuredRoadmap = await this.parseRoadmapResponseImproved(roadmapContent, projectId);
    
    // Save the roadmap to the database
    await this.saveRoadmapToDatabasenew(userId, structuredRoadmap, projectId);
    
    // Return the structured roadmap
    return structuredRoadmap;
    
  } catch (error) {
    console.error("Error generating digital project roadmap:", error);
    
    // Enhanced error reporting
    let errorMessage = `Failed to generate project roadmap: ${error.message}`;
    
    // Check if it's an Axios error for more details
    if (error.isAxiosError) {
      errorMessage += ` - Status: ${error.response?.status || 'unknown'}`;
      errorMessage += ` - Response: ${JSON.stringify(error.response?.data || {})}`;
    }
    
    throw new Error(errorMessage);
  }
}

// Helper functions to extract key information
async extractKeyFeatures(description: string, tags: string[]): Promise<string[]> {
  const features: string[] = [];

  // Extract from description - look for key phrases
  if (description.toLowerCase().includes('social media')) 
    features.push('Social Media Scheduler');

  if (description.toLowerCase().includes('email')) 
    features.push('Email Campaign Tools');

  if (description.toLowerCase().includes('seo')) 
    features.push('SEO Analytics Engine');

  // Extract from tags
  if (tags && tags.length > 0) {
    if (tags.some(tag => tag.toLowerCase().includes('email')))
      features.push('Email Marketing System');

    if (tags.some(tag => tag.toLowerCase().includes('automation')))
      features.push('Marketing Automation');

    if (tags.some(tag => tag.toLowerCase().includes('dashboard')))
      features.push('Business Analytics Dashboard');

    if (tags.some(tag => tag.toLowerCase().includes('subscription')))
      features.push('Subscription Management');
  }

  // Add default features if nothing was extracted
  if (features.length === 0) {
    features.push('Core Platform Features', 'User Management System');
  }

  return features;
}


async extractTargetAudience(description) {
  if (description.toLowerCase().includes('local business')) {
    return 'Local small business owners';
  }
  if (description.toLowerCase().includes('non-tech-savvy')) {
    return 'Non-technical business owners';
  }
  return 'Small business professionals';
}

async parseRoadmapResponseImproved(roadmapContent, projectId) {
  try {
const milestones: {
  projectId: string;
  name: string;
  description: string;
  status: string;
  startDate: Date;
  dueDate: Date;
  priority: string;
  tasks: {
    milestoneId: string | null;
    name: string;
    description: string;
    status: string;
    startDate: Date;
    dueDate: Date;
    priority: string;
  }[];
}[] = [];
    
    // Split the content by milestone headers
    // This regex looks for patterns like "Milestone 1:", "MILESTONE 2:", or "## Milestone 3:"
    const milestoneSections = roadmapContent.split(/(?:#{1,3}\s*)?milestone\s+\d+[:.]/i);
    
    // Skip the first element if it's just intro text
    const sections = milestoneSections.slice(milestoneSections[0].trim() ? 0 : 1);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section) continue;
      
      // Extract milestone information
      // First try to get structured data with labels like "Description:", "StartDate:", etc.
      const nameMatch = section.match(/(?:^|\n)(?:name:?\s*|title:?\s*|#{1,4}\s*)(.*?)(?=\n|$)/i);
      const descMatch = section.match(/description:?\s*(.*?)(?=\n(?:[a-z]+:|status:|start|due|priority)|\n\n|\n#{1,3}|$)/is);
      const statusMatch = section.match(/status:?\s*(.*?)(?=\n|$)/i);
      const startMatch = section.match(/startdate:?\s*(\d{4}-\d{2}-\d{2})/i);
      const dueMatch = section.match(/duedate:?\s*(\d{4}-\d{2}-\d{2})/i);
      const priorityMatch = section.match(/priority:?\s*(high|medium|low)/i);
      
      // If structured data wasn't found, try to extract from paragraph text
      const name = nameMatch ? nameMatch[1].trim() : `Milestone ${i + 1}`;
      const description = descMatch ? descMatch[1].trim() : this.extractDescription(section);
      const status = statusMatch ? statusMatch[1].trim().toLowerCase() : 'planned';
      
      // Handle dates - default to today and reasonable future date if not found
      const today = new Date();
      const defaultDuration = 14; // Default milestone duration in days
      let startDate = startMatch ? new Date(startMatch[1]) : new Date(today);
      let dueDate = dueMatch ? new Date(dueMatch[1]) : new Date(today);
      
      // If no dates found, calculate based on milestone position
      if (!startMatch && !dueMatch) {
        startDate = new Date(today);
        startDate.setDate(today.getDate() + (i * defaultDuration));
        dueDate = new Date(startDate);
        dueDate.setDate(startDate.getDate() + defaultDuration);
      }
      
      const priority = priorityMatch ? priorityMatch[1].toLowerCase() : 'medium';
      
      const milestone: {
  projectId: string;
  name: string;
  description: string;
  status: string;
  startDate: Date;
  dueDate: Date;
  priority: string;
  tasks: {
    milestoneId: string | null;
    name: string;
    description: string;
    status: string;
    startDate: Date;
    dueDate: Date;
    priority: string;
  }[];
} = {
  projectId,
  name,
  description,
  status,
  startDate,
  dueDate,
  priority,
  tasks: []
};

      
      // Extract tasks using multiple patterns
      // First look for explicitly labeled tasks
      const taskPatterns = [
        /task\s+\d+:?\s*(.*?)(?=\n\s*description:|\n\s*task\s+\d+:|$)/gis,
        /\*\*task\s+\d+\*\*:?\s*(.*?)(?=\n\s*\*\*task|\n\s*task\s+\d+:|$)/gis,
        /\d+\.\s*(.*?)(?=\n\s*\d+\.\s*|\n\s*task|\n\s*milestone|\n\s*#{1,3}|$)/gis,
        /[•\-]\s*(.*?)(?=\n\s*[•\-]|\n\s*task|\n\s*milestone|\n\s*#{1,3}|$)/gis
      ];
      
      // Find all task sections in the milestone content
     let taskMatches: RegExpMatchArray[] = [];

for (const pattern of taskPatterns) {
  const matches = [...section.matchAll(pattern)];
  if (matches.length > 0) {
    taskMatches = matches;
    break;
  }
}

      
      // If no structured tasks found, look for tables with task information
      if (taskMatches.length === 0 && section.includes('|')) {
        const tableRows = section.split('\n').filter(line => line.trim().startsWith('|'));
        
        for (let j = 0; j < tableRows.length; j++) {
          const row = tableRows[j];
          
          // Skip header and separator rows
          if (row.includes('---') || j === 0) continue;
          
          const cells = row.split('|').map(cell => cell.trim()).filter(Boolean);
          if (cells.length >= 1) {
            const taskName = cells[0].replace(/^task\s+\d+:?\s*/i, '').trim();
            const taskDesc = cells.length > 1 ? cells[1] : '';
            
            // Extract task details from subsequent rows if they exist
            let taskStartDate = startDate;
            let taskDueDate = new Date(taskStartDate);
            taskDueDate.setDate(taskStartDate.getDate() + 3); // Default 3-day task duration
            let taskPriority = 'medium';
            
            // Look for dates and priority in the task text
            const taskDateMatch = row.match(/(\d{4}-\d{2}-\d{2})/g);
            const taskPriorityMatch = row.toLowerCase().match(/priority:\s*(high|medium|low)/i);
            
            if (taskDateMatch && taskDateMatch.length >= 2) {
              taskStartDate = new Date(taskDateMatch[0]);
              taskDueDate = new Date(taskDateMatch[1]);
            }
            
            if (taskPriorityMatch) {
              taskPriority = taskPriorityMatch[1].toLowerCase();
            }
            
            milestone.tasks.push({
              milestoneId: null, // Will be set after milestone is created
              name: taskName,
              description: taskDesc,
              status: 'to do',
              startDate: taskStartDate,
              dueDate: taskDueDate,
              priority: taskPriority
            });
          }
        }
      } else {
        // Process regular task matches
        for (let j = 0; j < taskMatches.length; j++) {
          const match = taskMatches[j];
          const taskFullText = match[0];
          const taskName = match[1].trim();
          
          // Try to extract task description
          const taskDescMatch = taskFullText.match(/description:?\s*(.*?)(?=\n\s*status:|\n\s*start|\n\s*due|\n\s*priority:|$)/is);
          const taskDesc = taskDescMatch ? taskDescMatch[1].trim() : '';
          
          // Try to extract dates and priority
          const taskStartMatch = taskFullText.match(/startdate:?\s*(\d{4}-\d{2}-\d{2})/i);
          const taskDueMatch = taskFullText.match(/duedate:?\s*(\d{4}-\d{2}-\d{2})/i);
          const taskPriorityMatch = taskFullText.match(/priority:?\s*(high|medium|low)/i);
          
          // Set default task dates based on position in milestone
          let taskStartDate = new Date(startDate);
          taskStartDate.setDate(startDate.getDate() + j);
          let taskDueDate = new Date(taskStartDate);
          taskDueDate.setDate(taskStartDate.getDate() + 3); // Default 3-day task duration
          
          // Override with explicit dates if found
          if (taskStartMatch) taskStartDate = new Date(taskStartMatch[1]);
          if (taskDueMatch) taskDueDate = new Date(taskDueMatch[1]);
          
          const taskPriority = taskPriorityMatch ? taskPriorityMatch[1].toLowerCase() : 'medium';
          
          milestone.tasks.push({
            milestoneId: null, // Will be set after milestone is created
            name: taskName,
            description: taskDesc,
            status: 'to do',
            startDate: taskStartDate,
            dueDate: taskDueDate,
            priority: taskPriority
          });
        }
      }
      
      // If no tasks were found but we have a milestone, try to extract bullet points or numbered lists
      if (milestone.tasks.length === 0) {
        const lines = section.split('\n');
        for (const line of lines) {
          const bulletMatch = line.match(/^(?:\d+\.|[•\-*])\s+(.+)$/);
          if (bulletMatch) {
            milestone.tasks.push({
              milestoneId: null,
              name: bulletMatch[1].trim(),
              description: '',
              status: 'to do',
              startDate: startDate,
              dueDate: dueDate,
              priority: 'medium'
            });
          }
        }
      }
      
      // Add at least one default task if none were found
      if (milestone.tasks.length === 0) {
        milestone.tasks.push({
          milestoneId: null,
          name: `Implement ${name}`,
          description: `Complete all work required for ${name}`,
          status: 'to do',
          startDate: startDate,
          dueDate: dueDate,
          priority: 'medium'
        });
      }
      
      milestones.push(milestone);
    }
    
    // If no milestones were found, create a default one
    if (milestones.length === 0) {
      const defaultMilestone = {
        projectId,
        name: 'Project Setup',
        description: 'Initial project setup and planning',
        status: 'planned',
        startDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
        priority: 'high',
        tasks: [
          {
            milestoneId: null,
            name: 'Define project scope',
            description: 'Create detailed project requirements and scope document',
            status: 'to do',
            startDate: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
            priority: 'high'
          },
          {
            milestoneId: null,
            name: 'Set up development environment',
            description: 'Configure development tools and environments',
            status: 'to do',
            startDate: new Date(new Date().setDate(new Date().getDate() + 4)),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            priority: 'medium'
          }
        ]
      };
      
      milestones.push(defaultMilestone);
    }
    
    return { milestones };
  } catch (error) {
    console.error("Error parsing roadmap response:", error);
    throw new Error(`Failed to parse roadmap data: ${error.message}`);
  }
}

async extractDescription(text) {
  // Look for text that seems like a description
  const lines = text.split('\n');
const descriptionLines: string[] = [];
  
  // Skip the first line (usually the title)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Stop when we hit what looks like a task or another section
    if (line.match(/^(task|#{1,3}|\d+\.|\*\*task|\|)/i)) break;
    
    // Skip empty lines and metadata lines
    if (!line || line.match(/^(status|startdate|duedate|priority):/i)) continue;
    
    descriptionLines.push(line);
  }
  
  return descriptionLines.join(' ').trim();
}

// Improved database saving function
async saveRoadmapToDatabasenew(userId, roadmapData, projectId) {
  try {
    const { milestones } = roadmapData;
    
    // Start a transaction to ensure all data is saved correctly
    await this.prisma.$transaction(async (prismaClient) => {
      // Save each milestone and its tasks
      for (const milestone of milestones) {
        const { tasks, ...milestoneData } = milestone;
        
        // Ensure dates are proper Date objects
        const milestoneSaveData = {
          ...milestoneData,
          startDate: new Date(milestoneData.startDate),
          dueDate: new Date(milestoneData.dueDate),
          projectId: projectId ,
          assignedBy:userId,

        };
        
        // Create the milestone
        const createdMilestone = await prismaClient.milestone.create({
          data: milestoneSaveData
        });
        
        // Create all tasks for this milestone with proper date handling
        if (tasks && tasks.length > 0) {
          await prismaClient.task.createMany({
            data: tasks.map(task => ({
              name: task.name,
              description: task.description || '',
              status: task.status || 'to do',
              startDate: new Date(task.startDate),
              dueDate: new Date(task.dueDate),
              priority: task.priority || 'medium',
              milestoneId: createdMilestone.id,
              assignedBy:userId,
            }))
          });
        }
      }
      
      // Update project status to indicate roadmap has been created
      await prismaClient.project.update({
        where: { id: projectId },
        data: { status: 'IN_PROGRESS' }
      });
    });
    
    return true;
    
  } catch (error) {
    console.error("Error saving roadmap to database:", error);
    throw new Error(`Failed to save roadmap data: ${error.message}`);
  }
}





async translateContent(userId, textToTranslate, targetLanguage) {
  try {
    // Validate essential data
    if (!textToTranslate || !targetLanguage) {
      throw new Error("Text to translate or target language missing.");
    }
    
    // Create a detailed prompt for the AI
    const prompt = `
Translate the following text into ${targetLanguage}:

---BEGIN TEXT---
${textToTranslate}
---END TEXT---

Please provide only the translated text without any explanations or additional comments.
Make sure to maintain the original formatting, including line breaks, bullet points, and paragraph structure.
If there are any technical terms or specialized vocabulary, ensure they are translated appropriately for the target language.
`;

    console.log("Sending request to OpenRouter API for translation...");
    
    // Make the API request to OpenRouter
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "openai/gpt-3.5-turbo", // Using Claude 3 Opus for high-quality translation
        messages: [
          {
            role: 'system',
            content: `You are an expert translator specializing in accurate, natural-sounding translations while preserving meaning, tone, and context. You translate text directly without adding explanations unless specifically requested.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY3}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log("Response received from OpenRouter API");
    
    // Add detailed logging to inspect the API response
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));
    
    // More robust response handling
    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error("Invalid response structure from OpenRouter API. Response: " + JSON.stringify(response.data));
    }
    
    const messageContent = response.data.choices[0].message?.content;
    
    if (!messageContent) {
      throw new Error("No content in response message. Full response: " + JSON.stringify(response.data));
    }
    
const messageRaw = messageContent.trim();
const match = messageRaw.match(/---BEGIN TEXT---\n?([\s\S]*?)\n?---END TEXT---/);
const translatedContent = match ? match[1].trim() : messageRaw;
    
    if (!translatedContent || translatedContent.length < 1) {
      throw new Error("Empty or very short translation received: " + translatedContent);
    }
    
    console.log("Translation received, length:", translatedContent.length);
    
    // Save the translation to the translation history if needed
    // await this.saveTranslationToHistory(userId, textToTranslate, translatedContent, targetLanguage);
    
    // Return the translated content
    return {
      success: true,
      originalText: textToTranslate,
      translatedText: translatedContent,
      targetLanguage: targetLanguage,
      model: response.data.model || "anthropic/claude-3-opus-20240229"
    };
    
  } catch (error) {
    console.error("Error translating content:", error);
    
    // Enhanced error reporting
    let errorMessage = `Failed to translate content: ${error.message}`;
    
    // Check if it's an Axios error for more details
    if (error.isAxiosError) {
      errorMessage += ` - Status: ${error.response?.status || 'unknown'}`;
      errorMessage += ` - Response: ${JSON.stringify(error.response?.data || {})}`;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

}

  
