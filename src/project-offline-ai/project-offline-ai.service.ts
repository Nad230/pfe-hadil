import { Injectable } from '@nestjs/common';
import { ExpensesService } from 'src/expenses/expenses.service';
import { SaleService } from 'src/sale/sale.service';
import axios from 'axios';
import * as dayjs from 'dayjs';
import { UserlocationService } from 'src/userlocation/userlocation.service';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BusinessPlanService } from 'src/business-plan/business-plan.service';
import { AiPlanTask } from '@prisma/client';
import { SaleDigitalService } from 'src/sale-digital/sale-digital.service';
import { ProfitService } from 'src/profit/profit.service';
type PeriodType = 'day' | 'month' | 'year';
type SalesSummary = {
  totalRevenue: number;
  totalOrderCount: number;
  averageOrderValue: number;
  bestSellingProduct: { productId: string; name: string; totalSold: number } | null;
};

@Injectable()
export class ProjectOfflineAiService {
    constructor(
        private readonly saleService: SaleService,
        private readonly digitalService: SaleDigitalService,

        private readonly expenseService: ExpensesService,
        private readonly userLocationService: UserlocationService,
        private readonly authService: AuthService,
        private readonly businessPlanService: BusinessPlanService,
        private readonly profitService: ProfitService,


        private readonly prisma: PrismaService




      ) {}


      async getAiAdvice(
        projectName: string,
        location: string,
        businessType: string,
        userId: string,
        startHour: number,
        endHour: number
      ) {
        const sales = await this.saleService.getTodayTotal(userId);
        const expenses = await this.expenseService.getTodayTotalExpense(userId);
        const profit = sales - expenses;
      
        const now = dayjs();
        const timeNow = now.format('HH:mm');
        const currentHour = now.hour();
        const hoursPassed = currentHour - startHour;
        const hoursLeft = endHour - currentHour;
      
        // Determine mood and context based on performance and time
        const timeStage =
          hoursPassed <= 1
            ? "very early"
            : hoursLeft <= 1
            ? "closing soon"
            : "midday";
      
        const performance =
          profit < 0
            ? "a loss so far"
            : profit < 50
            ? "a slow day"
            : "a decent performance";
      
        const moodOpenings = [
          "Here's what you can try today 👇",
          "Let’s turn this day into a win 💡",
          "Some smart moves you can make now:",
          "Time to step things up 🚀",
          "Make the most of the moment 👇",
        ];
        const selectedOpening = moodOpenings[Math.floor(Math.random() * moodOpenings.length)];
      
        const prompt = `
      Business Name: ${projectName}
      Location: ${location}
      Type: ${businessType}
      
      🕒 It's currently ${timeNow}. The business started at ${startHour}:00 and will close at ${endHour}:00.
      📊 Sales so far: ${sales} TND
      💸 Expenses so far: ${expenses} TND
      💰 Current profit: ${profit} TND
      ⏳ ${hoursPassed} hours have passed (${timeStage}), and there are ${hoursLeft} hours left in the day.
      📈 Performance summary: ${performance}
      
      ${selectedOpening}
      
      Please give creative, short, and very specific advice that a real human coach would give at this moment — tailored to the business type, performance, and time of day.
      
      You can use light humor, encouragement, or constructive suggestions. Avoid repeating the same old advice like "use social media" unless there's a fresh twist to it. Mention performance, remaining hours, or time of day where helpful.
      `;
      
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: "mistralai/mixtral-8x7b-instruct",
            messages: [
              {
                role: 'system',
                content: `You are a smart and creative business coach. You give short, practical, and creative advice tailored to the business's live performance and time of day. Always respond as if you were coaching a real person.`
              },
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY4}`,
              'Content-Type': 'application/json',
            }
          }
        );
      
        const message = response.data?.choices?.[0]?.message?.content?.trim();
        return message || "No advice received.";
      }


      async getCountryInsights(country: string) {
        const prompt = `
      City: ${country}
      
      Please provide a friendly and clear summary for someone planning to start a small business in this country. Answer the following:
      
      1. 💰 What currency is used?
      2. 🗣️ What languages are commonly spoken?
      3. 👷 What are the most popular or in-demand jobs?
      4. ⏰ What is the common daily work schedule (when do people usually start and finish)?
      5. 🌍 What countries are nearby?
      6. 📱 Describe the digital ecosystem: Is e-commerce common? Are delivery apps or mobile money used?
      7. 🧠 Mention any relevant cultural or business habits/trends.
      
      Make the answer warm and practical, as if you’re guiding an entrepreneur new to the region. Use light emojis and short paragraphs for clarity.
        `;
      
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: "mistralai/mixtral-8x7b-instruct",
            messages: [
              {
                role: 'system',
                content: `You are a friendly and practical local business expert. You give useful summaries to entrepreneurs who are exploring a new city. Your tone is warm and informative, and you write in bullet points or short sections for clarity.`
              },
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY4}`,
              'Content-Type': 'application/json',
            }
          }
        );
      
        const message = response.data?.choices?.[0]?.message?.content?.trim();
        return message || "No insights received.";
      }













      async getCityBusinessInsights(city: string, country: string) {
        const prompt = `
      City: ${city}
      Country: ${country}
      
      Please provide a friendly and clear summary for someone planning to start a small business in this city. Answer the following questions based on this **specific city**, not just the country:
      
      1. 🌍 Number of tourists (per year or per season)?
      2. 🏪 Common types of small businesses (cafés, clothing shops, barbershops, etc.)?
      3. 💸 Average cost of rent for a small commercial space (give a rough range in USD)?
      4. 🚦 Are there traffic or commercial zones that affect business activity?
      5. 📍 What are some well-known landmarks that attract people?
      6. 🛍️ What do locals commonly enjoy doing or buying?
      
      Make it easy to read — like a local expert giving business tips. Use light emojis, bullet points, and short paragraphs for clarity. Keep it friendly and practical.
        `;
      
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: "mistralai/mixtral-8x7b-instruct",
            messages: [
              {
                role: 'system',
                content: `You are a friendly and practical local business expert. You give helpful summaries focused on a specific **city**, with insights tailored to someone who wants to start a small business there.`
              },
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY4}`,
              'Content-Type': 'application/json',
            }
          }
        );
      
        const message = response.data?.choices?.[0]?.message?.content?.trim();
        return message || "No insights received.";
      }
     


      async getSmartBusinessSuggestion(userId: string, count: number = 1) {
        const cityObj = await this.userLocationService.getUserCityByUserId(userId);
        const countryObj = await this.userLocationService.getUserCountryByUserId(userId);
      
        const city = cityObj?.city;
        const country = countryObj?.country;
      
        const estimatedBudget = await this.userLocationService.getUserBudgetRangeByUserId(userId);
      
        if (!city || !country) {
          throw new Error("User location not found.");
        }
      
        const [places, cityInsights, countryInsights] = await Promise.all([
          this.userLocationService.getPlaces(userId),
          this.getCityBusinessInsights(city, country),
          this.getCountryInsights(country),
        ]);
      
        const summarizedPlaces = Object.entries(places).map(([category, entries]) => {
          return `• ${category}: ${entries.length} nearby`;
        }).join('\n');
      
        const singlePrompt = `
📍 City: ${city}, ${country}
💰 Estimated Budget: $${estimatedBudget}

🏙️ City Insights:
${cityInsights}

🌍 Country Insights:
${countryInsights}

📌 Nearby Businesses:
${summarizedPlaces}

Now, based on:
- The local economy and culture
- The city’s business environment
- The user’s estimated budget
- The nearby competition and available services

👉 Give me **one** small‑business idea to start *right now*.

Return **exactly** this JSON format (no extra keys, no markdown):

{
  "title": "",
  "description": "",
  "whyItFits": "",
  "bonusTip": "",
  "difficulty": "",          // Easy | Medium | Hard
  "timeToProfit": ""         // e.g. "6‑9 months"
}

Be specific, friendly, and realistic!
`;

const multiplePrompt = `
📍 City: ${city}, ${country}
💰 Estimated Budget: $${estimatedBudget}

🏙️ City Insights:
${cityInsights}

🌍 Country Insights:
${countryInsights}

📌 Nearby Businesses:
${summarizedPlaces}

Now, based on the factors above, suggest the **top ${count}** small‑business ideas to start *right now*.

Return **exactly** this JSON array (no markdown):

[
  {
    "title": "",
    "description": "",
    "whyItFits": "",
    "bonusTip": "",
    "difficulty": "",       // Easy | Medium | Hard
    "timeToProfit": ""      // e.g. "3‑5 months"
  }
]

Number the ideas inside the array from most to least suitable in the order you output them. Be specific, friendly, and realistic!
`;

        const prompt = count === 1 ? singlePrompt : multiplePrompt;
      
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: "mistralai/mixtral-8x7b-instruct",
            messages: [
              {
                role: 'system',
                content: `You are a smart and realistic local business strategist. You help people start the right business for their city, budget, and surroundings. Be specific and helpful, like a mentor who knows the area.`
              },
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY4}`,
              'Content-Type': 'application/json',
            }
          }
        );
      
        const suggestion = response.data?.choices?.[0]?.message?.content?.trim();
        return suggestion || "No suggestion received.";
      }
      

   


      /*async saveAiPlan({
        jobId,
        userId,
        parsed,
        budget
      }: {
        jobId: string;
        userId: string;
        parsed: ReturnType<typeof this.parseActionPlan>;
        budget: number;
      }) {
        return this.prisma.$transaction(tx =>
          tx.startupPlan.create({
            data: {
              jobId,
              userId,
              title: 'Generated Plan',
              budget,
              // 1) Persist all extracted tips
              tips: {
                create: parsed.tips.map(t => ({ title: t.title, content: t.content }))
              },
              // 2) Persist risks
              risks: {
                create: parsed.risks
              },
              // 3) Persist calendar weeks
              calendarWeeks: {
                create: parsed.calendarWeeks
              },
              // 4) Persist AI tasks
              AiPlanTask: {
                create: parsed.stepTasks
              },
              // 5) Persist budget items
              budgetItems: {
                create: parsed.budgetItems
              },
              // 6) Persist minimum budget expenses
              UserExpense: {
                create: parsed.minimumExpenses.map(e => ({
                  title: e.title,
                  amount: e.amount,
                  notes: e.notes,
                  date: new Date()
                }))
              }
            }
          })
        );
      }
*/

    
      

      async extractSections(text: string): Promise<Record<string, string>> {
        const regex = /(?:^|\n)(\d\.\s|[\d]?\.\s?[^\n]*?)(?:\*{0,2}|🛠️|💡|🗓️|⚠️|🎯|💵)[^\n]*\n([\s\S]*?)(?=\n\d\.\s|\n\*{0,2}\d\.\s|$)/g;
        const sections: Record<string, string> = {};
        let match;
      
        while ((match = regex.exec(text)) !== null) {
          const title = match[1].trim();
          const content = match[2].trim();
          sections[title] = content;
        }
      
        return sections;
      }
      
      async normalizeBullets(text: string): Promise<string[]> {
        return text
          .split('\n')
          .map(line => line.trim().replace(/^[-*•]\s*/, '')) // remove bullet characters
          .filter(line => line.length > 0); // remove empty lines
      }
      
      async formatStepByStep(raw: string): Promise<
      {
        dayNumber: string;
        title: string;
        description: string;
      }[]
    > {
      const lines = raw.split('\n').map(line => line.trim()).filter(Boolean);
      const headerPattern = /^(\*{0,2})?Day\s*(\d+)(?:\s*[-–to]+\s*(\d+))?:?\s*(.*?)(\*{0,2})?$/i;
    
      const tasks: {
        dayNumber: string;
        title: string;
        description: string;
      }[] = [];
    
      let currentDayNumber = '';
      let currentTitle = '';
      let currentDescription: string[] = [];
    
      for (const line of lines) {
        const match = line.match(headerPattern);
    
        if (match) {
          // Save the previous task before starting a new one
          if (currentDayNumber || currentDescription.length) {
            tasks.push({
              dayNumber: currentDayNumber,
              title: currentTitle,
              description: currentDescription.join('\n').trim()
            });
          }
    
          const [, , startDay, endDay, titleRaw] = match;
          currentDayNumber = endDay ? `${startDay}–${endDay}` : startDay;
          currentTitle = titleRaw?.trim() || '';
          currentDescription = [];
        } else {
          currentDescription.push(line);
        }
      }
    
      // Push the last section
      if (currentDayNumber || currentDescription.length) {
        tasks.push({
          dayNumber: currentDayNumber,
          title: currentTitle,
          description: currentDescription.join('\n').trim()
        });
      }
    
      return tasks;
    }
    
      
    async formatBudgetStrategy(raw: string): Promise<{ name: string; suggestedCost: number; notes?: string }[]> {
      const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
      const items: { name: string; suggestedCost: number; notes?: string }[] = [];
    
      let i = 0;
      let counter = 1;
    
      while (i < lines.length) {
        const line = lines[i];
    
        // Case 1: Two-line format (e.g., title + number line)
        const titleMatch = line.match(/^\*{1,3}-?\s*(.+?)\*{1,3}$/);
        if (titleMatch) {
          const name = titleMatch[1].trim();
          const nextLine = lines[i + 1] || '';
          const numberMatch = nextLine.replace(/[^0-9.]/g, '');
          const suggestedCost = parseFloat(numberMatch);
    
          if (!isNaN(suggestedCost)) {
            items.push({ name, suggestedCost });
            i += 2;
            continue;
          }
        }
    
        // Case 2: Single-line with cost embedded
        const inlineMatch = line.match(/\$?(\d+(?:\.\d+)?)/);
        if (inlineMatch) {
          const suggestedCost = parseFloat(inlineMatch[1]);
          if (!isNaN(suggestedCost)) {
            items.push({
              name: `Item ${counter++}`,
              suggestedCost,
              notes: line
            });
          }
        }
    
        i++;
      }
    
      return items;
    }
    async formatLaunchCalendar(raw: string): Promise<{ weekNumber: number; summary: string }[]> {
      const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
      const weeks: { weekNumber: number; summary: string }[] = [];
    
      let currentWeek: number | null = null;
      let currentSummary: string[] = [];
    
      for (const line of lines) {
        // Match lines like "**Week 1:**", "Week 1 -", "*Week 1*", etc.
        const match = line.match(/(?:\*+)?\s*Week\s*(\d+)\s*[:\-–]?\s*(.*)/i);
        
        if (match) {
          // Save previous week if exists
          if (currentWeek !== null) {
            weeks.push({
              weekNumber: currentWeek,
              summary: currentSummary.join(' ')
            });
          }
    
          currentWeek = parseInt(match[1], 10);
          const summaryStart = match[2]?.trim();
          currentSummary = summaryStart ? [summaryStart] : [];
        } else if (currentWeek !== null) {
          currentSummary.push(line);
        }
      }
    
      // Push last week
      if (currentWeek !== null) {
        weeks.push({
          weekNumber: currentWeek,
          summary: currentSummary.join(' ')
        });
      }
    
      return weeks;
    }
    
      
      
      
    async formatRisks(raw: string): Promise<
  {
    risk: string;
    mitigation: string;
  }[]
> {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  const risks: {
    risk: string;
    mitigation: string;
  }[] = [];

  for (const line of lines) {
    const match = line.match(/^(.+?):\s*(.+)$/); // Match everything before ":" as risk, after as mitigation
    if (match) {
      const [, risk, mitigation] = match;
      risks.push({
        risk: risk.trim(),
        mitigation: mitigation.trim()
      });
    }
  }

  return risks;
}

      
      
      
async formatTips(raw: string): Promise<{ content: string }[]> {
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      // Remove leading "- " if present
      const cleaned = line.replace(/^[-•]\s*/, '');
      return { content: cleaned };
    });
}

      
      async formatMinimumBudget(raw: string): Promise<string> {
        return raw.trim();
      }
      

     
      


      async formatActionPlan(rawPlan: string, userId: string, startupPlanId: string) {
        const sections = {
          stepByStep: '',
          budgetStrategy: '',
          launchCalendar: '',
          risks: '',
          bonusTip: '',
          minimumBudget: ''
        };
      
        const cityObj = await this.userLocationService.getUserCityByUserId(userId);
      
        const sectionRegex = /\*\*([0-9]+)\. (.*?)\*\*\n([\s\S]*?)(?=(\*\*[0-9]+\.)|$)/g;
      
        let match;
        while ((match = sectionRegex.exec(rawPlan)) !== null) {
          const [, , title, content] = match;
          const trimmedTitle = title.trim();
      
          if (trimmedTitle === '🛠️ Step-by-step Action Plan for Launch/Growth') {
            sections.stepByStep = content.trim();
            const cleanTasks = await this.formatStepByStep(sections.stepByStep);
            console.log('Parsed tasks:', cleanTasks);
          
            // Optional: Save to database
            for (const task of cleanTasks) {
              await this.prisma.aiPlanTask.create({
                data: {
                  startupPlanId,
                  dayNumber: task.dayNumber,
                  title: task.title,
                  description: task.description,
                  completed: false
                }
              });
            }
      
          } else if (trimmedTitle === '💡 Smart Budget Strategy') {
            sections.budgetStrategy = content.trim();
          
            const cleanBudgetItems = await this.formatBudgetStrategy(sections.budgetStrategy);
            console.log('Parsed budget items:', cleanBudgetItems);
          
            for (const item of cleanBudgetItems) {
              await this.prisma.budgetItem.create({
                data: {
                  startupPlanId,
                  name: item.name,
                  suggestedCost: item.suggestedCost,
                  actualCost: null,
                  notes: item.notes ?? null
                }
              });
            }
            
                    
          }  else if (trimmedTitle === '🗓️ 30-Day Launch Calendar') {
            sections.launchCalendar = content.trim();
          
            const cleanCalendar = await this.formatLaunchCalendar(sections.launchCalendar);
            console.log('Parsed calendar weeks:', cleanCalendar);
          
            for (const week of cleanCalendar) {
              await this.prisma.calendarWeek.create({
                data: {
                  startupPlanId,
                  weekNumber: week.weekNumber,
                  summary: week.summary
                }
              });
            }
                    
      
          } else if (trimmedTitle === '⚠️ Main Risks and How to Avoid Them') {
            sections.risks = content.trim();
            const riskList = await this.formatRisks(sections.risks);
            console.log('Parsed risks:', riskList);
          
            for (const r of riskList) {
              await this.prisma.risk.create({
                data: {
                  startupPlanId,
                  risk: r.risk,
                  mitigation: r.mitigation
                }
              });}
      
          } else if (trimmedTitle.startsWith('🎯 Bonus Tip')) {
            sections.bonusTip = content.trim();
            const cleanTips = await this.formatTips(sections.bonusTip);
            console.log('Parsed tips:', cleanTips);
            
            for (const tip of cleanTips) {
              await this.prisma.tip.create({
                data: {
                  startupPlanId,
                  content: tip.content,
                }
              });
            }
            
          } else if (trimmedTitle === '💵 Minimum Budget Estimation') {
            sections.minimumBudget = content.trim();
            const cleanTextMin = this.formatMinimumBudget(sections.minimumBudget);
            console.log('hahi emchi min', cleanTextMin);
          }
        }
      
        return sections;
      }
      
     
      
      
      
      




      async generateBusinessActionPlan(userId: string,budget:number,BusinessesId?: string) {
        const cityObj = await this.userLocationService.getUserCityByUserId(userId);
        const countryObj = await this.userLocationService.getUserCountryByUserId(userId);
        const nearbyPlaces= await     this.userLocationService.getPlaces(userId);
        if (!BusinessesId) {
          throw new Error("Business ID is required.");
        }
        
        const selectedIdea = await this.businessPlanService.getByBusinessId(BusinessesId);
        

if (!selectedIdea) {
  throw new Error("No business idea found with this ID.");
}

if (!selectedIdea.title || !selectedIdea.description || !selectedIdea.difficulty) {
  throw new Error("Selected business idea is incomplete.");
}


              
        const city = cityObj?.city;
        const country = countryObj?.country;
      
        if (!city || !country) {
          throw new Error("User location not found.");
        }
        if (!budget || budget <= 0) {
          throw new Error("User budget is missing or zero. Please set your available budget first.");
        }
      
        let nearbyPlacesFormatted = '';

        if (nearbyPlaces && Object.keys(nearbyPlaces).length > 0) {
          // Flatten the nearby places
          const flatPlaces = Object.entries(nearbyPlaces)
            .flatMap(([category, places]) => 
              places.map(place => ({
                name: place.name,
                type: category,
                address: place.address,
              }))
            );
        
          const nearbyList = flatPlaces
            .slice(0, 10) // Limit to 10 entries for the prompt
            .map(place => `- ${place.name} (${place.type})`)
            .join('\n');
        
          nearbyPlacesFormatted = `
        🔎 Nearby Similar Businesses:
        ${nearbyList}
        
        Please advise the user to physically visit these locations during busy times (weekends, afternoons).
        - Check foot traffic.
        - Observe competitor quality.
        - Confirm if businesses are still active.
        - Check general customer interest.
          `;
        }
        
        const prompt = `
📍 City: ${city}, ${country}
💰 Available Budget: $${budget}
🚀 Selected Business Idea: ${selectedIdea.title}
📖 Description: ${selectedIdea.description}
⚡ Difficulty Level: ${selectedIdea.difficulty}

Now, based on the user's idea, available budget, and city:

You are an expert business mentor helping beginners start from scratch and make their first income as fast as possible.

Please create an ultra-practical, detailed action plan.

Organize your response into clear sections:

1. 🛠️ Step-by-step Action Plan for Launch/Growth
   - Organize the steps using day-by-day format (e.g., Day 1, Day 2–3, etc.).
   - Break it into small, realistic steps.
   - Mention tools, websites, or apps to use.
   - Suggest first actions to get first income or improvement.
   - Give examples when possible (like what to say to a business owner).

2. 💡 Smart Budget Strategy
   - Detailed budget breakdown (where each dollar goes).
   - Prioritize free or cheap options first.
   - How to spend wisely, free or cheap options first.

3. 🗓️ 30-Day Launch Calendar

   - Week-by-week what the user should do.
   -Summarize the user’s tasks week by week (e.g., Week 1 Summary, Week 2 Summary, etc.), showing what they should focus on.

4. ⚠️ Main Risks and How to Avoid Them

5. 🎯 Bonus Tip for Extra Success in ${city}

6. 💵 Minimum Budget Estimation
   - Estimate the realistic minimum startup cost needed for this business idea in ${city}.
   - If the user's available budget is enough, proceed normally.
   - If not, explain how much more money is needed, and suggest either:
     - A minimalist cheaper version.
     - Or saving options and realistic timeline.

Tone: Friendly, motivating, realistic.
Format: Clear bullet points and short paragraphs.

Important:
- Be friendly, motivating, realistic.
- Assume the user has no experience but is highly motivated.
- Focus on fast execution, real-world actions, and cash flow generation.
`;

        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: "mistralai/mixtral-8x7b-instruct",
            messages: [
              {
                role: 'system',
                content: `You are an expert business mentor. You help people create realistic action plans to launch and grow small businesses, adapted to their city, budget, and idea.`
              },
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY4}`,
              'Content-Type': 'application/json',
            }
          }
        );
      
        const actionPlan = response.data?.choices?.[0]?.message?.content?.trim();
        console.log(actionPlan)

        if (!actionPlan) {
          throw new Error("No action plan generated by AI.");
        }
        const startupPlan = await this.prisma.startupPlan.create({
          data: {
            userId,
            title: selectedIdea.title,
            jobId: selectedIdea.id,
            budget,
          },
        });
        
        const startupPlanId = startupPlan.id;
        


      
        const sections = await this.formatActionPlan(actionPlan,userId,startupPlanId);

       
        console.log(sections)
        
      
        return actionPlan || "No action plan generated.";
      
      }
      

   


async generateUltimateAiAssistantReply(userMessage: string, userId: string) {
  // 1. Save the user message first
  await this.prisma.assistantMessage.create({
    data: {
      userId,
      role: 'USER',
      content: userMessage,
      type: 'QUESTION'
    }
  });

  // 2. Get user profile data
  const userProfile = await this.getUserProfile(userId);
  
  // 3. Get conversation history (last 10 messages)
  const conversationHistory = await this.authService.getRecentMessages(userId);
  
  // 4. Analyze conversation context
  const conversationContext = this.analyzeConversationContext(userMessage, conversationHistory);
  
  // 5. Only fetch business data when absolutely necessary (with stricter conditions)
  let businessContext = {};
  if (this.needsBusinessData(userMessage, conversationContext, conversationHistory)) {
    businessContext = await this.getBusinessContext(userId);
  }
  
  // 6. Create a rephased version of the user message to guide the model better
  const rephrasedPrompt = this.rephrasePrompt(userMessage, conversationContext, conversationHistory);
  
  // 7. Choose the best model based on the conversation needs
  const model = this.chooseAppropriateModel(conversationContext, conversationHistory);
  
  // 8. Generate AI response with improved system prompt and the rephased user message
  let aiReply;
  
  try {
    // First attempt with main model
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [
          { 
            role: 'system', 
            content: `You are a friendly, casual AI assistant who talks like a real human friend.

IMPORTANT RULES:
- Keep responses SHORT - 3-4 sentences maximum
- Never use bullet points or numbered lists
- Never use emojis
- Never say "I hope this helps" or similar phrases
- Never use formatting like bold or italics
- Don't sound like a teacher or consultant
- Talk like a supportive friend giving quick advice
- Use casual, conversational language with contractions
- If giving advice, focus on just ONE specific action the person can take right now
- Never mention any data you have about the user's business unless they explicitly ask for it

Here is some info about the user - only use if directly relevant:
${JSON.stringify(userProfile, null, 2)}`
          },
          ...this.formatConversationHistory(conversationHistory.slice(-4)), // Only use last 4 messages
          { role: 'user', content: rephrasedPrompt }
        ],
        temperature: 0.7, // More randomness for conversational feel
        max_tokens: 250  // Force shorter responses
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY2}`,
          'Content-Type': 'application/json',
        }
      }
    );

    aiReply = response.data?.choices?.[0]?.message?.content?.trim();
  } catch (error) {
    console.error("Error with primary model:", error);
    
    // Fallback to Mixtral with stronger constraints if primary model fails
    const fallbackResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "mistralai/mixtral-8x7b-instruct",
        messages: [
          { 
            role: 'system', 
            content: `You are having a casual conversation with a friend. Keep your response VERY brief and informal.
            
IMPORTANT:
1. Maximum 3 sentences.
2. NO bullet points or numbered lists under any circumstances.
3. NO emojis, NO "hope this helps" phrases.
4. Write like you're texting a friend.
5. If you use ANY bullet points or numbered lists, your response will be rejected.
6. NEVER structure information in any kind of list.`
          },
          { role: 'user', content: `My friend said: "${userMessage}". Give me a casual, brief response with no lists or bullet points.` }
        ],
        temperature: 0.8,
        max_tokens: 150
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY3}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    aiReply = fallbackResponse.data?.choices?.[0]?.message?.content?.trim();
  }

  if (!aiReply) throw new Error("No AI response generated.");
  
  // 9. Post-process the response to ensure it meets our conversational requirements
  aiReply = this.postProcessResponse(aiReply, conversationContext);

  // 10. Save assistant reply
  const savedMessage = await this.prisma.assistantMessage.create({
    data: {
      userId,
      role: 'ASSISTANT',
      content: aiReply,
      type: 'ANSWER'
    }
  });

  return savedMessage;
}

chooseAppropriateModel(context: any, history: any[]) {
  // 1. If frustrated or urgent -> fastest and simplest model
  if (context.isFrustrated || context.wordCount < 5) {
    return "anthropic/claude-3-haiku"; // Fast, short responses
  }

  // 2. If business-related and more complex -> higher-quality model
  if (context.isBusinessRelated && context.wordCount > 10) {
    return "openai/gpt-4o-mini"; // High quality, good with logic
  }

  // 3. If the user is very informal and it's a casual chat
  if (context.isInformal || context.usesTextShorthand) {
    return "openai/gpt-3.5-turbo"; // Cheap, friendly tone
  }

  // 4. Default fallback
  return "mistralai/mixtral-8x7b-instruct";
}

// Rephrase the user's input to guide the model to respond better
rephrasePrompt(userMessage: string, context: any, history: any[]) {
  // If user message is very short or unclear, expand it into clearer instructions
  if (context.wordCount < 10 || !context.isQuestion) {
    return `The user said: "${userMessage}"
    
Based on our conversation, they seem to be asking about ${context.isBusinessRelated ? 'their business' : 'a personal matter'}. 
Give them a quick, friendly response in just a few sentences. Be casual and helpful, like you're texting a friend.
Don't use any bullet points or numbered lists. Keep it conversational and short.`;
  }
  
  // If user is frustrated or confused
  if (context.isFrustrated || userMessage.toLowerCase().includes('confused') || userMessage.toLowerCase().includes('understand')) {
    return `The user is feeling confused or frustrated. They said: "${userMessage}"
    
They need a VERY simple, clear answer with no complexity. Give them just ONE actionable tip they can use right now.
Maximum 3 sentences. No lists, no bullet points, no numbered steps. Just friendly, direct advice.`;
  }
  
  // If business related
  if (context.isBusinessRelated) {
    return `The user is asking about their business: "${userMessage}"
    
Give them ONE specific, practical tip they can implement today. No general advice or lists.
Keep your response under 3 sentences and very conversational. Talk like a helpful friend, not a business consultant.`;
  }
  
  // Default case
  return `The user said: "${userMessage}"
  
Reply in a casual, conversational way like you're texting a friend. Keep it short and helpful.
No bullet points, no lists, no numbering. Just 2-3 natural sentences at most.`;
}

// Analyze conversation context with more detail about user's communication style
analyzeConversationContext(userMessage: string, conversationHistory: any[]) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Basic checks
  const isGreeting = this.isGreeting(lowerMessage);
  const isQuestion = this.isQuestion(lowerMessage);
  const wordCount = userMessage.split(/\s+/).length;
  
  // Communication style analysis
  const hasTypos = this.hasTypos(userMessage);
  const usesTextShorthand = this.usesTextShorthand(userMessage);
  const isInformal = this.isInformalMessage(userMessage);
  
  // Content focus
  const businessKeywords = [
    'business', 'sales', 'revenue', 'profit', 'customer', 'marketing', 'strategy', 
    'growth', 'income', 'expense', 'finance', 'invoice', 'transaction', 'client',
    'sell', 'sold', 'selling', 'attract', 'conversion', 'lead', 'product', 'service'
  ];
  
  const businessKeywordCount = businessKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
  const isBusinessRelated = businessKeywordCount > 0;
  
  // Emotional tone
  const isFrustrated = this.userFrustrationLevel(userMessage, conversationHistory) > 0;
  const isExcited = lowerMessage.includes('!') || lowerMessage.includes('wow') || lowerMessage.includes('amazing');
  
  return {
    isGreeting,
    isQuestion,
    isBusinessRelated,
    businessKeywordCount,
    isFrustrated,
    isExcited,
    wordCount,
    hasTypos,
    usesTextShorthand,
    isInformal,
    messageLength: userMessage.length
  };
}

isGreeting(lowerMessage: string) {
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'yo', 'what\'s up', 'how are you'];
  return greetings.some(greeting => lowerMessage.includes(greeting)) && lowerMessage.length < 30;
}

isQuestion(lowerMessage: string) {
  return lowerMessage.includes('?') || 
         lowerMessage.startsWith('how') || 
         lowerMessage.startsWith('what') ||
         lowerMessage.startsWith('why') ||
         lowerMessage.startsWith('when') ||
         lowerMessage.startsWith('where') ||
         lowerMessage.startsWith('can') ||
         lowerMessage.startsWith('could') ||
         lowerMessage.includes('tell me');
}

hasTypos(message: string) {
  // Simple heuristic - not perfect but gives a sense of formal vs casual typing
  const commonTypos = ['i ', ' i ', 'didnt', 'dont', 'cant', 'wont', 'im ', ' im', 'u ', ' u ', 'ur ', ' ur', 'r ', ' r '];
  return commonTypos.some(typo => message.toLowerCase().includes(typo));
}

usesTextShorthand(message: string) {
  const shorthand = ['lol', 'omg', 'btw', 'idk', 'imo', 'tbh', 'rn', 'lmk', 'brb', 'thx', 'thks', 'pls', 'plz'];
  return shorthand.some(term => message.toLowerCase().includes(term));
}

isInformalMessage(message: string) {
  // Check for indicators of informal writing
  const hasMultipleQuestionMarks = (message.match(/\?/g) || []).length > 1;
  const hasMultipleExclamationPoints = (message.match(/!/g) || []).length > 1;
  const lacksCapitalization = message.toLowerCase() === message;
  const hasShortSentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0).some(s => s.trim().split(/\s+/).length < 5);
  
  return hasMultipleQuestionMarks || hasMultipleExclamationPoints || lacksCapitalization || hasShortSentences;
}

userFrustrationLevel(message: string, history: any[]) {
  const lowerMessage = message.toLowerCase();
  let frustrationScore = 0;
  
  // Check current message
  const frustrationKeywords = [
    'not working', 'problem', 'issue', 'confused', 'frustrating', 'annoying', 
    'don\'t understand', 'doesn\'t work', 'wtf', 'confusing', 'help me', 
    'unclear', 'not helpful', 'useless', 'waste', 'struggling'
  ];
  
  frustrationKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) frustrationScore += 1;
  });
  
  // Check for question marks or exclamation repetition
  if ((message.match(/\?{2,}/g) || []).length > 0) frustrationScore += 1;
  if ((message.match(/!{2,}/g) || []).length > 0) frustrationScore += 1;
  
  // Check recent history for repeated questions
  if (history.length > 2) {
    const recentUserMessages = history
      .filter(msg => msg.role === 'USER')
      .slice(-2)
      .map(msg => msg.content.toLowerCase());
    
    if (recentUserMessages.some(msg => 
      msg.includes('same question') || 
      msg.includes('asked already') || 
      msg.includes('didn\'t answer') ||
      msg.includes('didnt answer') ||
      msg.includes('not what i')
    )) {
      frustrationScore += 2;
    }
  }
  
  return frustrationScore;
}

// Much stricter business data requirements
needsBusinessData(userMessage: string, context: any, history: any[]) {
  // Explicitly asking for statistics or numbers
  const dataRequestTerms = [
    'how much did i', 'how many', 'my sales', 'my revenue', 'my customers', 
    'my transactions', 'my expenses', 'my income', 'my numbers', 'my stats',
    'statistics', 'data', 'analytics', 'how am i doing', 'performance'
  ];
  
  const isExplicitDataRequest = dataRequestTerms.some(term => 
    userMessage.toLowerCase().includes(term)
  );
  
  // If explicitly asking for data, provide it
  if (isExplicitDataRequest) {
    return true;
  }
  
  // For all other cases, don't include business data to keep responses conversational
  return false;
}

// Post-process the AI response to enforce our formatting rules
postProcessResponse(response: string, context: any) {
  // Remove any markdown formatting
  let processed = response.replace(/\*\*/g, '').replace(/\*/g, '');
  
  // Remove any numbered lists
  processed = processed.replace(/^\d+\.\s+/gm, '');
  
  // Remove any bullet points
  processed = processed.replace(/^[•*-]\s+/gm, '');
  
  // Replace multiple newlines with a single one
  processed = processed.replace(/\n{2,}/g, '\n');
  
  // Remove common AI phrasing like "I hope this helps"
  const phrasesToRemove = [
    'I hope this helps',
    'Hope this helps',
    'Let me know if you need anything else',
    'Feel free to ask',
    'Don\'t hesitate to',
    'I\'m here to help',
    'I\'m happy to assist'
  ];
  
  phrasesToRemove.forEach(phrase => {
    processed = processed.replace(new RegExp(phrase, 'gi'), '');
  });
  
  // Remove any remaining emojis
  processed = processed.replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '');
  
  // Trim extra whitespace
  processed = processed.trim();
  
  // If response is still too long, truncate it
  if (processed.length > 400 && !context.isBusinessRelated) {
    // Find a good sentence break point
    const sentenceBreak = processed.indexOf('. ', 200) + 1;
    if (sentenceBreak > 1) {
      processed = processed.substring(0, sentenceBreak);
    } else {
      processed = processed.substring(0, 250) + '...';
    }
  }
  
  return processed;
}

// Format conversation history for the AI
formatConversationHistory(conversationHistory: any[]) {
  return conversationHistory.map(msg => ({
    role: msg.role.toLowerCase() === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
}

// Get business context data for the user - unchanged
async getBusinessContext(userId: string) {
  try {
    // Get business type
    const businessType = await this.authService.getTypeBusinessByUser(userId);
    const type = businessType[0]?.projectType === 'online' ? 'online' : 'offline';
    
    // Get location
    const location = await this.userLocationService.getUserCityByUserId(userId);
    const city = location?.city || 'Unknown City';
    
    // Get sales data
    let summary: any;
    let invoices: any[] = [];
    let transactions: any[] = [];

    if (type === 'online') {
      summary = await this.digitalService.getFullSummary(userId);
      invoices = await this.digitalService.findAllByUser(userId);
      transactions = summary?.invoices || [];
    } else {
      summary = await this.saleService.getFullSummary(userId);
      invoices = await this.saleService.findAllByUser(userId);
      transactions = summary?.transactions || [];
    }

    const hasSales = summary?.week > 0;
    const hasInvoices = invoices.length > 0;
    const hasTransactions = transactions.length > 0;
    
    // Get expense data
    const expenses = await this.expenseService.getAllExpenses(userId);
    let recurringMonthlyTotal = 0;

    if (expenses.length > 0) {
      const daily = expenses.filter(e => e.repeatType?.toLowerCase() === 'daily');
      const weekly = expenses.filter(e => e.repeatType?.toLowerCase() === 'weekly');
      const monthly = expenses.filter(e => e.repeatType?.toLowerCase() === 'monthly');

      const estimateMonthlyCost = (list, multiplier) =>
        list.reduce((sum, e) => sum + (e.amount || 0) * multiplier, 0);

      const dailyTotal = estimateMonthlyCost(daily, 30);
      const weeklyTotal = estimateMonthlyCost(weekly, 4);
      const monthlyTotal = estimateMonthlyCost(monthly, 1);

      recurringMonthlyTotal = dailyTotal + weeklyTotal + monthlyTotal;
    }
    
    // Format business context for AI
    return {
      businessType: type,
      location: city,
      sales: {
        weekly: summary?.week || 0,
        monthly: summary?.month || 0,
        invoiceCount: invoices.length,
        transactionCount: transactions.length,
        hasSales,
        hasInvoices,
        hasTransactions
      },
      expenses: {
        monthly: recurringMonthlyTotal,
        expenseCount: expenses.length
      }
    };
  } catch (error) {
    console.error("Error fetching business context:", error);
    return {};
  }
}














async getUserProfile(userId: string) {
  // Get freelance profile data
  const freelanceProfile = await this.getFreelanceProfile(userId);
  
  // Get user location
  const location = await this.userLocationService.getUserCityByUserId(userId);
  const city = location?.city || 'Unknown City';
  const country = (await this.userLocationService.getUserCountryByUserId(userId))?.country || 'Unknown Country';
  
  // Get business type
  const businessType = await this.authService.getTypeBusinessByUser(userId);
  const type = businessType[0]?.projectType === 'online' ? 'online' : 'offline';
  
  return {
    freelanceProfile,
    location: { city, country },
    businessType: type
  };
}

// Get freelance profile data
async getFreelanceProfile(userId: string) {
  try {
    // Fetch from your database
    const profile = await this.authService.getFreelanceProfile(userId)
    
    return profile || null;
  } catch (error) {
    console.error("Error fetching freelance profile:", error);
    return null;
  }
}




      


     /* async getNearbyPlaces({ lat, lng }: { lat: number; lng: number }) {
        const llParam = `@${lat},${lng},14z`;
        const params = {
          engine: 'google_maps',
          type: 'search',
          q: 'businesses',
          ll: llParam,
          hl: 'en',
          api_key: process.env.SERP_API_KEY,
        };
      
        try {
          const response = await axios.get('https://serpapi.com/search', { params });
          const formatted = this.formatNearbyPlaces(response.data);
          return formatted;
        } catch (err: any) {
          console.error('Failed to fetch places:', err.response?.data || err.message);
          return [];
        }
      }
      async formatNearbyPlaces(data: any) {
        if (!data || !data.local_results) return [];
      
        return data.local_results.map((biz: any) => ({
          name: biz.title || '',
          types: biz.types || [],
          rating: biz.rating || 0,
          reviews: biz.reviews || 0,
          address: biz.address || '',
          phone: biz.phone || '',
          website: biz.website || '',
          isOpenNow: biz.open_state || 'Unknown',
          hours: biz.hours || '',
          operatingHours: biz.operating_hours || {},
          location: biz.gps_coordinates || { latitude: null, longitude: null },
          image: biz.thumbnail || '',
        }));
      }
      */
      
      


      async  getLinkedInSearchQuery(skills: string[], city: string, country: string, experienceLevel: string) {
        const prompt = `
The user is looking for jobs on LinkedIn.

Here is their data:
- Skills: ${skills.join(', ')}
- Location: ${city}, ${country}
- Experience Level: ${experienceLevel}

Your task:
1. Suggest 3 real-world job titles this user should search for.
2. For each title, generate a working LinkedIn search URL (use title, location, and experience).
3. Recommend any useful filters (like Entry Level, Remote, etc.).
4. Format like this:

- 💼 Job Title: ...
- 🔗 LinkedIn Link: ...
- 🧰 Filters: ...

Keep it short, and make sure links work.
`;

        try {
          console.log("🧠 Prompt sent to OpenRouter:\n", prompt);
      
          const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: "openai/gpt-3.5-turbo",
              messages: [
                {
                  role: 'system',
                  content: `You are a helpful job search assistant focused on LinkedIn. You help users build effective search queries and filter combinations.`
                },
                {
                  role: 'user',
                  content: prompt
                }
              ]
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY2}`,
                'Content-Type': 'application/json',
              }
            }
          );
      
          console.log("✅ Response from OpenRouter:\n", JSON.stringify(response.data, null, 2));
      
          const result = response.data?.choices?.[0]?.message?.content?.trim();
          return result || "No search query generated.";
        } catch (error) {
          console.error("❌ Error from OpenRouter:", error?.response?.data || error.message);
          return "Failed to fetch LinkedIn search query.";
        }
      }


      async  getJobListingsFromSerpApi(
        skills: string,
        location: string,
        experienceLevel: string
      ): Promise<any[]> {
        const apiKey = process.env.SERP_API_KEY;
      
        const skillList = skills.split(',').map(s => s.trim()).join(' ');
        const query = `${skillList} ${experienceLevel} developer`;
      
        console.log('Sending query:', query, 'at location:', location);
      
        const params = {
          engine: "google_jobs",
          q: query,
          location,
          api_key: apiKey,
        };
      
        try {
          const response = await axios.get("https://serpapi.com/search", { params });
          const jobs = response.data.jobs_results || [];
      
          return jobs.slice(0, 5).map(job => ({
            title: job.title,
            company: job.company_name,
            location: job.location,
            description: job.description,
            link: job.related_links?.[0]?.link || '',
          }));
        } catch (error) {
          console.error("Error fetching job listings:", error.message);
          return [];
        }
      }




      async getJobsBySkill(skill: string, country: string, continent: string, userId: string) {
        const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(skill)}`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          const jobs = data.jobs;
    
          const countryLower = country?.toLowerCase() || "";
          const continentLower = continent?.toLowerCase() || "";
    
          const filteredJobs = jobs.filter((job) => {
            const location = job.candidate_required_location?.toLowerCase() || "";
    
            return (
              location.includes("worldwide") ||
              location.includes(countryLower) ||
              location.includes(continentLower)
            );
          });
          const stripHtml = (html: string) => {
            return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
          };
          
    
          for (const job of filteredJobs) {
            const existing = await this.prisma.aiJob.findUnique({
              where: { url: job.url },
            });
    
            if (!existing) {
              const plainDescription = stripHtml(job.description || "");
          
              await this.prisma.aiJob.create({
                data: {
                  userId,
                  url: job.url,
                  title: job.title,
                  companyName: job.company_name,
                  companyLogo: job.company_logo || null,
                  category: job.category || null,
                  tags: job.tags || [],
                  jobType: job.job_type || null,
                  publicationDate: new Date(job.publication_date),
                  candidateRequiredLocation: job.candidate_required_location || null,
                  salary: job.salary || null,
                  description: plainDescription,
                },
              });
            }
          }
    
          return filteredJobs;
        } catch (error) {
          console.error("Error fetching jobs by skill:", error);
          return [];
        }
      }



      async getAiJobsByUser(userId: string) {
        try {
          const jobs = await this.prisma.aiJob.findMany({
            where: { userId },
            orderBy: { publicationDate: 'desc' },
          });
      
          return jobs;
        } catch (error) {
          console.error("Error retrieving AI jobs:", error);
          return [];
        }
      }

      async getAiJobById(jobId: string) {
        try {
          const job = await this.prisma.aiJob.findUnique({
            where: { id: jobId },
          });
      
          return job;
        } catch (error) {
          console.error("Error retrieving AI job by ID:", error);
          return null;
        }
      }
      

      async getChosedAiJobsByUser(userId: string) {
        try {
          const jobs = await this.prisma.aiJob.findMany({
            where: {
              userId,
              chosed: true,
            },
            orderBy: {
              publicationDate: 'desc',
            },
          });
      
          return jobs;
        } catch (error) {
          console.error("Error retrieving chosed AI jobs:", error);
          return [];
        }
      }
      
      

      async getRemoteOkJobs(skill: string, country: string, continent: string) {
  const url = `https://remoteok.com/api`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0', 
      },
    });

    const data = await response.json();

    const jobs = data.slice(1);

    const skillLower = skill.toLowerCase();
    const countryLower = country?.toLowerCase() || "";
    const continentLower = continent?.toLowerCase() || "";

    const filteredJobs = jobs.filter((job) => {
      const position = job.position?.toLowerCase() || job.title?.toLowerCase() || "";
      const location = job.location?.toLowerCase() || "";

      const matchesSkill = position.includes(skillLower);
      const matchesLocation =
        location.includes("worldwide") ||
        location.includes(countryLower) ||
        location.includes(continentLower);

      return matchesSkill && matchesLocation;
    });

    // Normalize the result to match Remotive format (optional)
    const normalizedJobs = filteredJobs.map((job) => ({
      id: job.id,
      url: job.url,
      title: job.position || job.title,
      company_name: job.company || "Unknown",
      company_logo: job.logo || "",
      category: job.tags?.[0] || "",
      tags: job.tags || [],
      job_type: job.type || "Full-time",
      publication_date: job.date || new Date().toISOString(),
      candidate_required_location: job.location || "",
      salary: job.salary || "",
      description: job.description || "",
    }));

    return normalizedJobs;
  } catch (error) {
    console.error("Error fetching jobs from Remote OK:", error);
    return [];
  }
}





async updateAiJobStatusAndChosed(aiJobId: string, status: string, chosed: boolean) {
  try {
    const updatedAiJob = await this.prisma.aiJob.update({
      where: { id: aiJobId },
      data: {
        status,
        chosed,
      },
    });
    return updatedAiJob;
  } catch (error) {
    console.error('Error updating aiJob:', error);
    throw new Error('Failed to update aiJob.');
  }
}


      
      
async generateInterviewQuestions(description: string, tags: string[]) {
  try {
    const prompt = `
You are an expert technical recruiter coaching a candidate right before an interview.

Given the following information:
- 📄 Job Description: ${description}
- 🏷️ Relevant Tags/Skills: ${tags.join(', ')}

👉 Please generate the most likely interview questions the candidate will be asked.

For each question:
- Provide **three practical steps** coaching how the candidate should answer it. (e.g., "Start by...", "Mention...", "Finish by...")
- Also give an **example phrase** the candidate can use to **start their answer confidently**.
- Focus on **concrete**, **motivational**, and **interviewer-impressing** advice.
- Pretend you are speaking directly to the candidate, seconds before they enter the interview.

Format the result strictly as a JSON array like:
[
  {
    "question": "The interview question?",
    "answerAdvice": {
      "steps": [
        "First advice step",
        "Second advice step",
        "Third advice step"
      ],
      "examplePhrase": "Example first sentence the candidate can use to start answering."
    }
  },
  ...
]
`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "mistralai/mixtral-8x7b-instruct",
        messages: [
          {
            role: 'system',
            content: 'You are an experienced technical recruiter helping candidates prepare for interviews.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY4}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const aiResponse = response.data?.choices?.[0]?.message?.content?.trim();

    try {
      const questions = JSON.parse(aiResponse);
      return questions;
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", aiResponse);
      return [];
    }
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return [];
  }
}




async generateLocalBusinessActionPlan(userId: string) {
  const budget = await this.businessPlanService.getBudgetRangeByUserId(userId);
  const country = await this.businessPlanService.getCountryByUserId(userId);
  const city = await this.businessPlanService.getCityByUserId(userId);
  const details = await this.businessPlanService.getDescriptionAndTitleByUserId(userId);

  if (!budget || budget <= 0) {
    throw new Error("User budget is missing or zero. Please set your available budget first.");
  }

  if (!city || !country) {
    throw new Error("User location not found.");
  }

  if (!details || (!details.projectName && !details.description)) {
    throw new Error("Project name or description missing.");
  }

  const nearbyPlaces = await this.userLocationService.getPlaces(userId);

  let nearbyPlacesFormatted = '';
  if (nearbyPlaces && Object.keys(nearbyPlaces).length > 0) {
    const flatPlaces = Object.entries(nearbyPlaces)
      .flatMap(([category, places]) =>
        places.map(place => ({
          name: place.name,
          type: category,
          address: place.address,
        }))
      );

    const nearbyList = flatPlaces
      .slice(0, 10)
      .map(place => `- ${place.name} (${place.type})`)
      .join('\n');

    nearbyPlacesFormatted = `
🔎 Nearby Similar Businesses:
${nearbyList}

Please advise the user to physically visit these locations during busy times (weekends, afternoons).
- Check foot traffic.
- Observe competitor quality.
- Confirm if businesses are still active.
- Check general customer interest.
`;
  }

  const prompt = `
📍 City: ${city}, ${country}
💰 Available Budget: $${budget}
🚀 Existing Business Concept: ${details.projectName || 'No Title'}
📖 Description: ${details.description || 'No Description'}

Now, based on the user's real business idea, available budget, and location:

You are an expert business mentor helping real business owners launch or grow their small business fast with practical steps.

Please create an ultra-practical, detailed action plan.

Organize your response into clear sections:

1. 🛠️ Step-by-step Action Plan for Launch/Growth
   - Organize the steps using day-by-day format (e.g., Day 1, Day 2–3, etc.).
   - Break it into small, realistic steps.
   - Mention tools, websites, or apps to use.
   - Suggest first actions to get first income or improvement.
   - Give examples when possible (like what to say to a business owner).


2. 💡 Smart Budget Strategy
   - Detailed budget breakdown.
   - Prioritize free or cheap options first.

3. 🗓️ 30-Day Growth Calendar
   - Week-by-week actions.

4. ⚠️ Main Risks and How to Avoid Them

5. 🎯 Bonus Tip for Extra Success in ${city}

6. 💵 Minimum Budget Estimation
   - Estimate if user's current budget is enough.
   - If not, suggest:
     - A cheaper version.
     - Or ways to get extra funding.

${nearbyPlacesFormatted}

Tone: Friendly, motivating, realistic.
Format: Clear bullet points and short paragraphs.
`;

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: 'system',
          content: `You are an expert business mentor. You help people create realistic action plans to launch and grow small businesses, adapted to their city, budget, and idea.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY4}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const actionPlan = response.data?.choices?.[0]?.message?.content?.trim();
  console.log(actionPlan)

  if (!actionPlan) {
    throw new Error("No action plan generated by AI.");
  }
  const startupPlan = await this.prisma.startupPlan.create({
    data: {
      userId,
      title: details.projectName ?? '',
      BusinessId: details.id,
      budget,
    },
  });
  
  const startupPlanId = startupPlan.id;
  



  const sections = await this.formatActionPlan(actionPlan,userId,startupPlanId);

 
  console.log(sections)
  

  return actionPlan || "No action plan generated.";
}


/************************************************* */




/****************************** */

async generateProfitAdvice(userId: string, type: PeriodType, date: Date) {
  const summary = await this.saleService.getProfitSummaryByPeriod(userId, type, date);

  const {
    totalRevenue,
    totalExpenses,
    profit,
    bestSellingProduct,
    mostCommonExpenseType,
    totalDuration,
    revenuePerHour,
    profitPerHour,
  } = summary;

  const prompt = `
🧾 Business Summary for ${date.toDateString()} (${type})

- Total Revenue: $${totalRevenue}
- Total Expenses: $${totalExpenses}
- Net Profit: $${profit}
- Best Selling Product: ${bestSellingProduct?.name ?? 'N/A'} (${bestSellingProduct?.totalSold ?? 0} sold, $${bestSellingProduct?.revenueGenerated ?? 0} revenue)
- Most Common Expense Type: ${mostCommonExpenseType?.type ?? 'N/A'} ($${mostCommonExpenseType?.totalSpent ?? 0} across ${mostCommonExpenseType?.count ?? 0} transactions)
- Time Worked: ${totalDuration ?? 0} hours
- Revenue per Hour: ${revenuePerHour ?? 'N/A'}
- Profit per Hour: ${profitPerHour ?? 'N/A'}

🤖 Please review this summary and offer:
1. A short analysis of what’s going well or badly
2. Specific, realistic suggestions for what the user should do next to improve their profit
3. Any warning signs or mistakes to avoid
Use a friendly, motivating tone.
  `;

  const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
    model: "mistralai/mixtral-8x7b-instruct",
    messages: [
      {
        role: "system",
        content: "You are a business coach AI helping users optimize small business performance using their data. Give clear, realistic advice.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  }, {
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY4}`,
      'Content-Type': 'application/json',
    }
  });

  const message = response.data?.choices?.[0]?.message?.content?.trim();

  if (message) {
    await this.prisma.aiBusinessAdvice.create({
      data: {
        userId,
        category: 'PROFIT',
        message,
        date,
        relatedPeriodType: type,
      },
    });
  }

  return message || "No advice generated.";
}


async generateSalesAdvisorPlan(userId: string, date: Date) {
  // 1) Fetch summaries
  const [
    daySummary,
    weekSummary,
    monthSummary,
    yearSummary,
    fullSummary,
  ] = await Promise.all([
    this.saleService.getSalesSummaryByPeriod(userId, 'day', date),
    this.saleService.getSalesSummaryByPeriod(userId, 'week', date),
    this.saleService.getSalesSummaryByPeriod(userId, 'month', date),
    this.saleService.getSalesSummaryByPeriod(userId, 'year', date),
    this.saleService.getSalesSummary(userId),
  ]);

  // 2) Other data
  const transactions = await this.saleService.getSalesByPeriod(userId, 'month', date);
  const todayRevenue = await this.saleService.getTodayTotal(userId);
  const todayAOV = await this.saleService.getTodayAverageOrderValue(userId);

  // 3) Helpers
  const formatCurrency = (n: number) => `$${n.toFixed(2)}`;
  const formatDate = (d: Date) => new Date(d).toDateString();

  // 4) Build day-of-week aggregates
  const salesByDayOfWeek: Record<string, number> = {};
  const revenueByDayOfWeek: Record<string, number> = {};

  transactions.forEach(t => {
    const dayIdx = new Date(t.date).getDay();
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayIdx];
    const qty = t.quantity;
    const price = t.product?.price ?? 0;
    const rev = qty * price;

    salesByDayOfWeek[dayName] = (salesByDayOfWeek[dayName] || 0) + qty;
    revenueByDayOfWeek[dayName] = (revenueByDayOfWeek[dayName] || 0) + rev;
  });

  // 5) Best performing day
  let bestDay = { day: 'None', revenue: 0 };
  (Object.entries(revenueByDayOfWeek) as [string, number][]).forEach(([day, rev]) => {
    if (rev > bestDay.revenue) bestDay = { day, revenue: rev };
  });

  // 6) Best-day revenue % of month
  const monthlyRevenue = monthSummary.totalRevenue;
  const bestDayPercentage = monthlyRevenue > 0
    ? ((bestDay.revenue / monthlyRevenue) * 100).toFixed(0)
    : '0';

  // 7) Zero-sales days
  const allDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const zeroDays = allDays.filter(d => !salesByDayOfWeek[d]);

  // 8) Product-level aggregates
  interface ProdStats { name: string; unitsSold: number; revenue: number; occurrences: number; }
  const productSales: Record<string, ProdStats> = {};

  transactions.forEach(t => {
    const pid = t.productId;
    if (!productSales[pid]) {
      productSales[pid] = { 
        name: t.product?.name ?? 'Unknown',
        unitsSold: 0,
        revenue: 0,
        occurrences: 0
      };
    }
    productSales[pid].unitsSold += t.quantity;
    productSales[pid].revenue += t.quantity * (t.product?.price ?? 0);
    productSales[pid].occurrences += 1;
  });

  const sortedProducts = Object.values(productSales).sort((a, b) => b.unitsSold - a.unitsSold);
  const topProduct = sortedProducts[0] ?? null;
  
  const topProductPercentage = topProduct && monthSummary.totalOrderCount > 0
    ? ((topProduct.unitsSold / monthSummary.totalOrderCount) * 100).toFixed(0)
    : '0';

  // 9) Product combinations
  const dateToProducts: Record<string, Set<string>> = {};
  transactions.forEach(t => {
    const key = new Date(t.date).toISOString().split('T')[0];
    dateToProducts[key] = dateToProducts[key] || new Set();
    if (t.product?.name) dateToProducts[key].add(t.product.name);
  });

  const combosCount: Record<string, number> = {};
  Object.values(dateToProducts).forEach(set => {
    const arr = Array.from(set);
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const combo = `${arr[i]} + ${arr[j]}`;
        combosCount[combo] = (combosCount[combo] || 0) + 1;
      }
    }
  });

  const topCombos = (Object.entries(combosCount) as [string, number][])
    .sort(([,a],[,b]) => b - a)
    .slice(0, 3)
    .map(([combo, cnt]) => `${combo} (bought together ${cnt} times)`);

  // 10) Best seller line
  const bestSellerLine = monthSummary.bestSellingProduct
    ? `Best-Selling Product: ${monthSummary.bestSellingProduct.name} (${monthSummary.bestSellingProduct.totalSold} sold – ${topProductPercentage}% of total orders)`
    : 'Best-Selling Product: N/A';

  // Build a more advanced prompt with the enriched data
  const prompt = `
📊 DETAILED Sales Summary for AI Business Advisor:

-- CORE METRICS --
- Today Revenue: ${formatCurrency(todayRevenue)}
- Today AOV: ${formatCurrency(todayAOV)}
- This Week Revenue: ${formatCurrency(weekSummary?.totalRevenue ?? 0)}
- This Month Revenue: ${formatCurrency(monthSummary?.totalRevenue ?? 0)}
- This Year Revenue: ${formatCurrency(yearSummary?.totalRevenue ?? 0)}
- Monthly Orders: ${monthSummary?.totalOrderCount ?? 0}
- Monthly AOV: ${formatCurrency(monthSummary?.averageOrderValue ?? 0)}
- ${bestSellerLine}

-- ADVANCED INSIGHTS --
- Best Sales Day: ${bestDay.day} (${bestDayPercentage}% of monthly revenue)
- Days With Zero Sales: ${zeroDays.join(', ') || 'None'}
- Top Product Combinations: ${topCombos.length ? topCombos.join(' | ') : 'No clear combinations detected'}

-- DAY OF WEEK PERFORMANCE --
${Object.entries(salesByDayOfWeek).map(([day, quantity]) => 
  `${day}: ${quantity} items sold (${formatCurrency(revenueByDayOfWeek[day] || 0)})`
).join('\n')}

🧾 Transaction Samples:
${transactions.slice(0,10).map(t =>
  `- ${t.product?.name ?? 'Unknown'}: ${t.quantity} pcs @ ${formatCurrency(t.product?.price ?? 0)} on ${formatDate(t.date)}`
).join('\n')}
I need a hyper-specific, data-driven business action plan that directly references my exact sales numbers, days, and products. DO NOT give general advice - every suggestion must reference specific data points.

Include these sections:

1. 📈 PERFORMANCE IMPROVEMENTS: Analyze my exact day patterns (like my ${bestDay.day} strength and ${zeroDays.join('/')} weaknesses) and give specific fixes.

2. 💰 BUNDLE RECOMMENDATIONS: Create 2-3 specific product bundles with exact prices based on my top combinations (${topCombos.length ? topCombos[0].split(' (')[0] : 'my top products'}). Show the regular price and the bundle price.

3. 🕐 DAY-BY-DAY STRATEGY: Give specific tactics for EACH day of the week based on my sales patterns, especially how to fix my zero-sales days.

4. 🚀 AOV GROWTH PLAN: My AOV is ${formatCurrency(monthSummary?.averageOrderValue ?? 0)}. Give exact upsell offers to increase it to at least ${formatCurrency((monthSummary?.averageOrderValue ?? 0) * 1.25)}.

5. 🛍️ PRODUCT FOCUS: My best seller is ${monthSummary?.bestSellingProduct?.name ?? 'unknown'} at ${topProductPercentage}% of sales. Tell me exactly how to balance promoting this versus diversifying.

6. 📦 INVENTORY PLANNING: Give exact quantity recommendations for each product on each day, especially for ${bestDay.day} when I sell ${salesByDayOfWeek[bestDay.day] ?? 0} items.

7. 📆 WEEKLY SCHEDULE: Create a precise hour-by-hour plan for one week with specific tasks and goals for each day.

8. 📢 CUSTOM CAMPAIGNS: Design 2 specific marketing campaigns with exact products, prices, and target days/customers based on my data patterns.

9. 📍 TIME TARGETING: Tell me exactly when to promote certain products based on the sales patterns you see.

10. 📉 WEAK POINTS: Identify my 3 biggest vulnerabilities with exact metrics and specific solutions.

11. 💯 ONE-WEEK CHALLENGE: Give me specific targets to beat current performance with exact numbers for orders, revenue, and AOV.

Remember: Every single recommendation must reference my exact products, days, or metrics. No generic advice!`;

  try {
  const response = await axios.post(
  'https://openrouter.ai/api/v1/chat/completions',
  {
    model: "anthropic/claude-3-sonnet-20240229",
        max_tokens: 1000, // Ensure we get a full, detailed response
        temperature: 0.7, // Lower temperature for more factual, data-driven responses
        messages: [
          {
            role: "system",
            content: `You are an elite business analytics AI that helps small shop owners improve their sales through deep data analysis and personalized strategies. 

CRITICAL INSTRUCTION: Your advice must be ULTRA-SPECIFIC, using exact numbers, percentages, and data from the sales history. Generic business advice will be rejected. 

For example:
- WRONG: "Focus on increasing sales during low-performing days"
- RIGHT: "Monday-Tuesday (0 sales): Launch a '2-for-1 كبوسن' promo on Mondays to break your zero-sales pattern"

- WRONG: "Promote product combinations"
- RIGHT: "Create a '3.5 DZD Power Bundle' combining كبوسن (2 DZD) + قهوة كحلة (1 DZD) + كروسون (0.7 DZD) discounted from 3.7 DZD"

Every single suggestion must reference exact products, days, or numbers from the data.`
          },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY2}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      console.error("⚠️ OpenRouter response missing content:", response?.data);
      throw new Error("No AI advice returned.");
    }

    // ✅ Save the AI advice
    await this.prisma.aiBusinessAdvice.create({
      data: {
        userId,
        category: 'SALES',
        message: content,
        date: date,
        relatedPeriodType: 'MONTHLY', // or WEEKLY/DAILY if you want dynamic logic
        relatedEntityId: null
      }
    });

    // Format response for easier reading
    const formattedContent = content
      .replace(/\*\*/g, '') // Remove markdown bold for cleaner display
      .replace(/#{1,5} /g, ''); // Remove markdown headers

    return {
      advice: formattedContent,
      metadata: {
        todayRevenue,
        todayAOV,
        bestSeller: monthSummary?.bestSellingProduct?.name ?? null,
        sampleTransactions: transactions.slice(0, 10),
        salesByDay: salesByDayOfWeek,
        revenueByDay: revenueByDayOfWeek,
        bestPerformingDay: bestDay,
        zeroDays,
        topProductCombinations: topCombos,
        rawPrompt: prompt
      }
    };
  } catch (err) {
    console.error("❌ AI Generation Error:", err?.response?.data || err.message || err);
    throw new Error("AI generation failed. Please try again later.");
  }
}



async generateDigitalAdvisorPlan(userId: string, date: Date) {
  // First, check if the user already has a digital advice plan
  try {
    // Get existing digital plans for this user
    const existingPlans = await this.profitService.getDigitalAdviceai(userId);
    
    // Check if there's an existing DIGITAL category plan
    const existingDigitalPlan = existingPlans.find(plan => plan.category === 'DIGITAL');
    
    // 1) Fetch actual data with proper error handling
    const [
      daySummary,
      weekSummary,
      monthSummary,
      yearSummary,
      fullSummary,
    ] = await Promise.all([
      this.digitalService.getSalesSummaryByPeriod(userId, 'day', date),
      this.digitalService.getSalesSummaryByPeriod(userId, 'week', date),
      this.digitalService.getSalesSummaryByPeriod(userId, 'month', date),
      this.digitalService.getSalesSummaryByPeriod(userId, 'year', date),
      this.digitalService.getFullSummary(userId),
    ]);

    // 2) Get raw transaction data - this will be crucial for honest analysis
    const transactions = await this.digitalService.getSalesByPeriod(userId, 'month', date);
    const recentTransactions = await this.digitalService.getSalesByPeriod(userId, 'week', date);
    const historicalTransactions = await this.digitalService.getSalesByPeriod(userId, 'year', date);
    const todayRevenue = await this.digitalService.getTodayTotal(userId);
    const todayAIV = await this.digitalService.getTodayAverageInvoiceValue(userId);
    const bestProject = await this.digitalService.getBestProjectByPeriod(userId, 'month', date);

    // 3) Assess data quality to avoid making false assumptions
    const dataAssessment = {
      hasEnoughMonthlyData: transactions.length >= 5,
      hasEnoughYearlyData: historicalTransactions.length >= 12,
      hasRecentActivity: recentTransactions.length > 0,
      hasDiverseClients: new Set(transactions.map(t => t.invoice.clientId)).size > 1,
      hasDiverseProjects: new Set(transactions.map(t => t.invoice.projectId)).size > 1,
      hasDiverseServices: false, // Will be assessed below
    };

    // 4) Helper functions
    const formatCurrency = (n: number) => `$${n.toFixed(2)}`;
    const formatDate = (d: Date) => new Date(d).toDateString();

    // 5) Extract service types more meaningfully from descriptions
    interface ServiceItem {
      type: string;
      description: string;
      amount: number;
      frequency: number;
    }

    const serviceItems: ServiceItem[] = [];
    const serviceTypes: Record<string, number> = {};
    let totalServices = 0;

    // Define meaningful service categories for digital work
    const serviceCategories = {
      "web design": ["design", "ui", "ux", "wireframe", "mockup", "prototype", "layout"],
      "frontend": ["frontend", "react", "vue", "angular", "html", "css", "javascript", "typescript", "responsive"],
      "backend": ["backend", "api", "database", "server", "php", "node", "python", "java", "scala", "go"],
      "fullstack": ["fullstack", "full stack", "end-to-end", "full-stack"],
      "e-commerce": ["ecommerce", "e-commerce", "shop", "store", "cart", "checkout", "payment"],
      "cms": ["wordpress", "drupal", "joomla", "contentful", "cms", "content management"],
      "seo": ["seo", "search engine", "keywords", "ranking", "google"],
      "branding": ["brand", "logo", "identity", "style guide"],
      "mobile": ["mobile", "app", "ios", "android", "react native", "flutter"],
      "consulting": ["consult", "advise", "strategy", "planning", "roadmap"],
      "maintenance": ["maintenance", "support", "update", "fix", "bug", "hosting"],
      "testing": ["test", "qa", "quality", "unit test", "integration test"]
    };

    transactions.forEach(t => {
      t.invoice.items.forEach(item => {
        // Match service category based on description keywords
        const desc = item.description.toLowerCase();
        let matchedType = "other";
        
        for (const [category, keywords] of Object.entries(serviceCategories)) {
          if (keywords.some(keyword => desc.includes(keyword))) {
            matchedType = category;
            break;
          }
        }
        
        // Track the item
        serviceItems.push({
          type: matchedType,
          description: item.description,
          amount: item.amount,
          frequency: 1
        });
        
        // Update aggregates
        serviceTypes[matchedType] = (serviceTypes[matchedType] || 0) + item.amount;
        totalServices += item.amount;
      });
    });

    // Update service diversity assessment
    dataAssessment.hasDiverseServices = Object.keys(serviceTypes).length > 2;

    // 6) Find common service combinations from the same invoice
    const serviceCombinations: Record<string, number> = {};

    transactions.forEach(t => {
      const invoiceServiceTypes = new Set<string>();
      
      t.invoice.items.forEach(item => {
        const desc = item.description.toLowerCase();
        for (const [category, keywords] of Object.entries(serviceCategories)) {
          if (keywords.some(keyword => desc.includes(keyword))) {
            invoiceServiceTypes.add(category);
            break;
          }
        }
      });
      
      // Record combinations of 2 or more services
      if (invoiceServiceTypes.size >= 2) {
        const combo = Array.from(invoiceServiceTypes).sort().join(" + ");
        serviceCombinations[combo] = (serviceCombinations[combo] || 0) + 1;
      }
    });

    // 7) Client segmentation
    interface ClientStats { 
      id: string; 
      name: string; 
      revenue: number; 
      invoiceCount: number; 
      lastInvoiceDate: Date;
      averageInvoiceValue: number;
      services: Record<string, number>;
    }

    const clientData: Record<string, ClientStats> = {};

    transactions.forEach(t => {
      const cid = t.invoice.clientId;
      const clientName = t.invoice.client?.name || 'Unknown';
      const invoiceTotal = t.invoice.items.reduce((sum, item) => sum + item.amount, 0);
      const invoiceDate = new Date(t.date);
      
      if (!clientData[cid]) {
        clientData[cid] = { 
          id: cid,
          name: clientName,
          revenue: 0,
          invoiceCount: 0,
          lastInvoiceDate: invoiceDate,
          averageInvoiceValue: 0,
          services: {}
        };
      }
      
      // Update client stats
      clientData[cid].revenue += invoiceTotal;
      clientData[cid].invoiceCount += 1;
      
      if (invoiceDate > clientData[cid].lastInvoiceDate) {
        clientData[cid].lastInvoiceDate = invoiceDate;
      }
      
      // Track services for this client
      t.invoice.items.forEach(item => {
        const desc = item.description.toLowerCase();
        let matchedType = "other";
        
        for (const [category, keywords] of Object.entries(serviceCategories)) {
          if (keywords.some(keyword => desc.includes(keyword))) {
            matchedType = category;
            break;
          }
        }
        
        clientData[cid].services[matchedType] = (clientData[cid].services[matchedType] || 0) + 1;
      });
    });

    // Calculate average invoice value for each client
    Object.values(clientData).forEach(client => {
      client.averageInvoiceValue = client.revenue / client.invoiceCount;
    });

    // 8) Project analysis
    interface ProjStats { 
      id: string; 
      name: string; 
      revenue: number; 
      invoiceCount: number; 
      clientName: string;
      averageInvoiceValue: number;
      services: Record<string, number>;
    }

    const projectData: Record<string, ProjStats> = {};

    transactions.forEach(t => {
      const pid = t.invoice.projectId;
      const projName = t.invoice.project?.name || 'Unknown';
      const clientName = t.invoice.client?.name || 'Unknown';
      const invoiceTotal = t.invoice.items.reduce((sum, item) => sum + item.amount, 0);
      
      if (!projectData[pid]) {
        projectData[pid] = { 
          id: pid,
          name: projName,
          revenue: 0,
          invoiceCount: 0,
          clientName: clientName,
          averageInvoiceValue: 0,
          services: {}
        };
      }
      
      // Update project stats
      projectData[pid].revenue += invoiceTotal;
      projectData[pid].invoiceCount += 1;
      
      // Track services for this project
      t.invoice.items.forEach(item => {
        const desc = item.description.toLowerCase();
        let matchedType = "other";
        
        for (const [category, keywords] of Object.entries(serviceCategories)) {
          if (keywords.some(keyword => desc.includes(keyword))) {
            matchedType = category;
            break;
          }
        }
        
        projectData[pid].services[matchedType] = (projectData[pid].services[matchedType] || 0) + 1;
      });
    });

    // Calculate average invoice value for each project
    Object.values(projectData).forEach(project => {
      project.averageInvoiceValue = project.revenue / project.invoiceCount;
    });

    // 9) Time analysis - only if we have enough data
    const timeAnalysis = {
      hasTimeTrend: false,
      invoiceFrequencyDays: 0,
      periodsWithoutInvoice: 0,
      longestGapDays: 0
    };

    if (historicalTransactions.length >= 5) {
      // Sort transactions by date
      const sortedTransactions = [...historicalTransactions].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Calculate average time between invoices
      let totalDays = 0;
      let gaps: number[] = [];    // <-- tell TS this will hold numbers

      for (let i = 1; i < sortedTransactions.length; i++) {
        const daysDiff = Math.floor(
          (new Date(sortedTransactions[i].date).getTime() -
          new Date(sortedTransactions[i-1].date).getTime()) /
          (1000 * 60 * 60 * 24)
        );

        totalDays += daysDiff;
        gaps.push(daysDiff);
      }

      timeAnalysis.invoiceFrequencyDays = totalDays / (sortedTransactions.length - 1);
      timeAnalysis.longestGapDays = Math.max(...gaps);
      timeAnalysis.hasTimeTrend = true;
      
      // Check for periods with no activity
      const thirtyDayPeriods = Math.ceil(totalDays / 30);
      let periodsWithInvoice = new Set();
      
      sortedTransactions.forEach(t => {
        const periodIndex = Math.floor(
          (new Date(t.date).getTime() - new Date(sortedTransactions[0].date).getTime()) / 
          (1000 * 60 * 60 * 24 * 30)
        );
        periodsWithInvoice.add(periodIndex);
      });
      
      timeAnalysis.periodsWithoutInvoice = thirtyDayPeriods - periodsWithInvoice.size;
    }

    // 10) Average pricing by service
    const servicePricing: Record<string, number> = {};
    const serviceFrequency: Record<string, number> = {};

    transactions.forEach(t => {
      t.invoice.items.forEach(item => {
        const desc = item.description.toLowerCase();
        let matchedType = "other";
        
        for (const [category, keywords] of Object.entries(serviceCategories)) {
          if (keywords.some(keyword => desc.includes(keyword))) {
            matchedType = category;
            break;
          }
        }
        
        servicePricing[matchedType] = (servicePricing[matchedType] || 0) + item.amount;
        serviceFrequency[matchedType] = (serviceFrequency[matchedType] || 0) + 1;
      });
    });

    // Calculate average price per service
    const serviceAvgPricing: Record<string, number> = {};
    Object.keys(servicePricing).forEach(service => {
      if (serviceFrequency[service] > 0) {
        serviceAvgPricing[service] = servicePricing[service] / serviceFrequency[service];
      }
    });

    // 11) Extract top services and metrics
    const sortedServices = Object.entries(serviceTypes)
      .sort(([, a], [, b]) => b - a)
      .map(([service, amount]) => {
        const percentage = totalServices > 0 ? ((amount / totalServices) * 100) : 0;
        return {
          name: service,
          amount,
          percentage,
          avgPrice: serviceAvgPricing[service] || 0
        };
      });

    const topServices = sortedServices.slice(0, 3);

    const sortedClients = Object.values(clientData)
      .sort((a, b) => b.revenue - a.revenue);

    const topClient = sortedClients[0] || null;
    const topClientPercentage = topClient && monthSummary.totalRevenue > 0
      ? ((topClient.revenue / monthSummary.totalRevenue) * 100)
      : 0;

    const sortedProjects = Object.values(projectData)
      .sort((a, b) => b.revenue - a.revenue);

    const topProject = sortedProjects[0] || null;
    const topProjectPercentage = topProject && monthSummary.totalRevenue > 0
      ? ((topProject.revenue / monthSummary.totalRevenue) * 100)
      : 0;

    // Calculate recurring vs. new business
    const clientsWithMultipleInvoices = Object.values(clientData)
      .filter(c => c.invoiceCount > 1);

    const recurringRevenuePercentage = monthSummary.totalRevenue > 0
      ? (clientsWithMultipleInvoices.reduce((sum, c) => sum + c.revenue, 0) / monthSummary.totalRevenue * 100)
      : 0;

    // 12) Construct a more honest prompt based on data quality assessment
    let promptApproach = "";

    if (dataAssessment.hasEnoughMonthlyData) {
      if (dataAssessment.hasEnoughYearlyData) {
        promptApproach = "COMPREHENSIVE_ANALYSIS";
      } else {
        promptApproach = "MODERATE_DATA";
      }
    } else if (dataAssessment.hasRecentActivity) {
      promptApproach = "LIMITED_DATA";
    } else {
      promptApproach = "INSUFFICIENT_DATA";
    }

    // Sample transactions for reference
    const sampleInvoices = transactions.slice(0, 5).map(t => {
      const invoiceTotal = t.invoice.items.reduce((sum, item) => sum + item.amount, 0);
      return {
        client: t.invoice.client?.name || 'Unknown',
        project: t.invoice.project?.name || 'Unknown',
        amount: invoiceTotal,
        date: formatDate(t.date),
        items: t.invoice.items.map(item => ({
          description: item.description,
          amount: item.amount
        }))
      };
    });

    // 13) Construct the prompt based on the data quality
    let prompt = `
📊 DIGITAL PROFESSIONAL BUSINESS ANALYSIS

-- CORE DATA QUALITY --
Data Assessment: ${promptApproach}
Has Diverse Clients: ${dataAssessment.hasDiverseClients ? "Yes" : "No"}
Has Diverse Projects: ${dataAssessment.hasDiverseProjects ? "Yes" : "No"}
Has Diverse Services: ${dataAssessment.hasDiverseServices ? "Yes" : "No"}
Has Time Trend Data: ${timeAnalysis.hasTimeTrend ? "Yes" : "No"}

-- CORE METRICS --
Today Revenue: ${formatCurrency(todayRevenue)}
Today Average Invoice Value: ${formatCurrency(todayAIV)}
This Week Revenue: ${formatCurrency(weekSummary?.totalRevenue ?? 0)}
This Month Revenue: ${formatCurrency(monthSummary?.totalRevenue ?? 0)}
This Year Revenue: ${formatCurrency(yearSummary?.totalRevenue ?? 0)}
Monthly Invoices: ${monthSummary?.invoiceCount ?? 0}
Monthly Average Invoice Value: ${formatCurrency(monthSummary?.averageInvoiceValue ?? 0)}
${topProject ? `Best Project: ${topProject.name} (${formatCurrency(topProject.revenue)} - ${topProjectPercentage.toFixed(0)}% of revenue)` : 'No project data available'}
${topClient ? `Top Client: ${topClient.name} (${formatCurrency(topClient.revenue)} - ${topClientPercentage.toFixed(0)}% of revenue)` : 'No client data available'}

-- BUSINESS COMPOSITION --
Recurring Revenue: ${recurringRevenuePercentage.toFixed(0)}% from repeat clients
Top Services: ${topServices.map(s => `${s.name} (${formatCurrency(s.amount)} - ${s.percentage.toFixed(0)}%)`).join(', ')}
${timeAnalysis.hasTimeTrend ? `Average Invoice Frequency: Every ${timeAnalysis.invoiceFrequencyDays.toFixed(0)} days` : ''}
${timeAnalysis.hasTimeTrend ? `Longest Gap Between Invoices: ${timeAnalysis.longestGapDays} days` : ''}

-- SERVICE PRICING --
${Object.entries(serviceAvgPricing)
  .filter(([service, price]) => price > 0)
  .sort(([, a], [, b]) => b - a)
  .map(([service, price]) => `${service}: ${formatCurrency(price)} average`)
  .join('\n')}

-- SAMPLE INVOICES --
${sampleInvoices.map(inv => `- ${inv.client}: ${formatCurrency(inv.amount)} on ${inv.date} (Project: ${inv.project})
  Items: ${inv.items.map(item => `${item.description} (${formatCurrency(item.amount)})`).join(', ')}
`).join('\n')}

As a digital professional advisor, analyze my business based ONLY on the actual data provided. I need practical advice that acknowledges the limitations of my data while giving me actionable insights where possible.

IMPORTANT INSTRUCTIONS:

1. BE HONEST about data limitations - don't invent patterns where they don't exist

2. Focus on what the data ACTUALLY shows about my business

3. Provide advice that works for my specific service types (${topServices.map(s => s.name).join(', ')})

4. If certain advice isn't possible due to limited data, acknowledge that and provide alternative approaches

5. All recommendations must be directly tied to my actual metrics, not generic business advice
`;

    // Add data-appropriate sections based on data quality
    if (promptApproach === "COMPREHENSIVE_ANALYSIS" || promptApproach === "MODERATE_DATA") {
      prompt += `
    Please include these sections:

6. 📊 DATA REALITY CHECK: Honestly assess what my data does and doesn't tell us about my business.

7. 💼 SERVICE OPTIMIZATION: Based on my actual service mix (${topServices.map(s => s.name).join(', ')}), recommend specific improvements to my offerings.

8. 💰 PRICING STRATEGY: Analyze my current pricing (${Object.entries(serviceAvgPricing).slice(0, 3).map(([service, price]) => `${service}: ${formatCurrency(price)}`).join(', ')}) and suggest evidence-based adjustments.

9. 🧑‍💼 CLIENT RELATIONSHIP PLAN: Given that my top client represents ${topClientPercentage.toFixed(0)}% of revenue, provide specific retention and diversification strategies.

10. 📈 GROWTH OPPORTUNITIES: Based on my actual service mix and client behavior, recommend 2-3 specific growth directions with concrete next steps.

11. 📉 BUSINESS RISKS: Identify 2-3 actual vulnerabilities in my business model based on the data (not generic risks).

12. 📆 30-DAY ACTION PLAN: Give me a realistic 30-day plan with specific actions I can take to improve my business.`;
    } 
    else if (promptApproach === "LIMITED_DATA") {
      prompt += `
    Please include these sections:

13. 📊 DATA REALITY CHECK: Honestly assess what my limited data does and doesn't tell us about my business.

14. 💼 INITIAL INSIGHTS: Based on the few transactions I have, what initial patterns or opportunities can you identify?

15. 💰 PRICING CONSIDERATIONS: Based on my limited invoice history, provide initial pricing guidance.

16. 📊 DATA COLLECTION PLAN: Recommend what business metrics I should start tracking to make better decisions.

17. 📈 EARLY GROWTH TACTICS: Based on my specific services (${topServices.map(s => s.name).join(', ')}), what are 2-3 practical next steps?

18. 📆 30-DAY FOUNDATION PLAN: Give me a realistic 30-day plan focused on establishing business foundations.`;
    }
    else {
      prompt += `
    Please include these sections:

19. 📊 DATA LIMITATIONS: Explain what can and cannot be determined from my extremely limited data.

20. 📝 BUSINESS FOUNDATIONS: Since I have insufficient transaction history, provide guidance on establishing core business operations.

21. 📊 ESSENTIAL TRACKING: Recommend what business metrics I should begin tracking immediately.

22. 📈 DIGITAL SERVICE BUSINESS MODEL: Provide general advice on structuring a digital service business in my area (${topServices.length > 0 ? topServices[0].name : 'digital services'}).

23. 📆 60-DAY BUSINESS ESTABLISHMENT PLAN: Give me a realistic 60-day plan for setting up proper business foundations.`;
    }

    // Add a final note about data honesty
    prompt += `\n\nREMEMBER: I value data honesty over false certainty. If you can't determine something from my data, please say so directly rather than making assumptions. Provide advice I can trust based on what you actually know from my data.`;

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: "anthropic/claude-3-sonnet-20240229",
          max_tokens: 1500,
          temperature: 0.5, // Lower temperature for more factual, data-driven responses
          messages: [
            {
              role: "system",
              content: `You are a specialized business advisor for digital professionals like web developers, designers, and digital consultants. Your advice is characterized by:

1. DATA HONESTY: You never pretend to see patterns where there's insufficient data. You're transparent about what can and cannot be determined from the available information.

2. PRACTICAL SPECIFICITY: Your recommendations directly reference the actual services, clients, and revenue figures in the data.

3. DIGITAL INDUSTRY EXPERTISE: You understand that digital professionals have different business dynamics than retail or other businesses.

4. NO FAKE CERTAINTY: You don't make up trends or patterns to sound authoritative.

5. ACTIONABLE DEPTH: When you make recommendations, you include specific implementation details that are relevant to digital service businesses.

Your response should feel like advice from an experienced digital business consultant who puts truth and actionable insights above sounding impressive.`            
            },
            {
              role: "user",
              content: prompt
            }
          ]
        },
        {
          headers: {
            Authorization:`Bearer ${process.env.OPENROUTER_API_KEY2}`,
            'Content-Type': 'application/json',
          }
        }
      );

const content = response?.data?.choices?.[0]?.message?.content?.trim();

      if (!content) {
        console.error("⚠️ OpenRouter response missing content:", response?.data);
        throw new Error("No AI advice returned.");
      }

      // The key change: Check if we need to update an existing plan or create a new one
      if (existingDigitalPlan) {
        // Update the existing plan with new content
        await this.prisma.aiBusinessAdvice.update({
          where: {
            id: existingDigitalPlan.id  // Assuming the plan object has an id field
          },
          data: {
            message: content,
            date: date,
            relatedPeriodType: 'MONTHLY',
            relatedEntityId: null
          }
        });
      } else {
        // Create a new plan as before
        await this.prisma.aiBusinessAdvice.create({
          data: {
            userId,
            category: 'DIGITAL',
            message: content,
            date: date,
            relatedPeriodType: 'MONTHLY',
            relatedEntityId: null
          }
        });
      }

      // Format response for easier reading
      const formattedContent = content
        .replace(/\*\*/g, '')
        .replace(/#{1,5} /g, '');

      return {
        advice: formattedContent,
        metadata: {
          dataQuality: {
            approach: promptApproach,
            hasDiverseClients: dataAssessment.hasDiverseClients,
            hasDiverseProjects: dataAssessment.hasDiverseProjects,
            hasDiverseServices: dataAssessment.hasDiverseServices,
            hasTimeTrend: timeAnalysis.hasTimeTrend
          },
          coreMetrics: {
            todayRevenue,
            todayAIV, 
            weekRevenue: weekSummary?.totalRevenue ?? 0,
            monthRevenue: monthSummary?.totalRevenue ?? 0,
            yearRevenue: yearSummary?.totalRevenue ?? 0,
            monthlyInvoiceCount: monthSummary?.invoiceCount ?? 0,
            monthlyAIV: monthSummary?.averageInvoiceValue ?? 0
          },
          topServices,
          topClient: topClient ? {
            name: topClient.name,
            revenue: topClient.revenue,
            percentage: topClientPercentage,
            invoiceCount: topClient.invoiceCount,
            averageInvoiceValue: topClient.averageInvoiceValue
          } : null,
          topProject: topProject ? {
            name: topProject.name, 
            revenue: topProject.revenue,
            percentage: topProjectPercentage,
            clientName: topProject.clientName
          } : null,
          servicePricing: serviceAvgPricing,
          sampleInvoices
        }
      };
    } catch (err) {
      console.error("❌ AI Generation Error:", err?.response?.data || err.message || err);
      throw new Error("AI generation failed. Please try again later.");
    }
  } catch (error) {
    console.error("❌ Digital Advisor Error:", error);

    // Return a graceful error response with guidance
    return {
      advice: "I couldn't generate your business advice due to a technical issue. This often happens when there's not enough transaction data to analyze. Try adding more invoices to get meaningful insights.",
      error: true,
      metadata: {
        errorMessage: error.message || "Unknown error occurred"
      }
    };
  }
}






















    }      