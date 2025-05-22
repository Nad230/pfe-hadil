// dto/create-assistant-profile.dto.ts
import { IsOptional, IsBoolean, IsArray, IsString } from 'class-validator'

export class CreateAssistantProfileDto {
  @IsOptional()
  @IsBoolean()
  isNewFreelancer?: boolean

  @IsOptional()
  @IsBoolean()
  hasExistingWork?: boolean

  @IsOptional()
  @IsBoolean()
  firstTime?: boolean

  @IsOptional()
  @IsBoolean()
  hasTeam?: boolean

  @IsOptional()
  @IsBoolean()
  hasTime?: boolean

  @IsOptional()
  @IsBoolean()
  interestedInJob?: boolean

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[]

  @IsOptional()
  @IsString()
  mainGoal?: string

  @IsOptional()
  @IsString()
  currentStep?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  plan?: string[]

  @IsOptional()
  @IsString()
  aiNotes?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memory?: string[]
}
