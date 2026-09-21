import { Body, Controller, Post } from '@nestjs/common';
import {
  estimateBcsFromChecklist,
  estimateBmi,
  estimateWeight,
  getCarePlan,
  HennekeChecklistAnswers,
  WeightUnit,
} from '@asbaan/shared';

interface EstimateRequest {
  heartGirth: number;
  bodyLength: number;
  /** Withers height, same unit family as heartGirth/bodyLength (cm for metric, inches for imperial). Optional — BMI is only returned when supplied. */
  withersHeight?: number;
  unit?: WeightUnit;
  checklist: HennekeChecklistAnswers;
  discipline: 'jumping' | 'dressage';
}

const LB_PER_KG = 0.453592;

@Controller('v1/body-condition')
export class BodyConditionController {
  @Post('estimate')
  estimate(@Body() body: EstimateRequest) {
    const unit = body.unit ?? 'metric';
    const weight = estimateWeight(body.heartGirth, body.bodyLength, unit);
    const bcs = estimateBcsFromChecklist(body.checklist);
    const carePlan = getCarePlan(bcs, body.discipline);

    let bmi: number | undefined;
    if (body.withersHeight) {
      const weightKg = unit === 'imperial' ? weight * LB_PER_KG : weight;
      const heightM = unit === 'imperial' ? body.withersHeight * 0.0254 : body.withersHeight / 100;
      bmi = estimateBmi(weightKg, heightM);
    }

    return { weight, unit, bcs, bmi, carePlan };
  }
}
