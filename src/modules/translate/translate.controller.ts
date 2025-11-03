import { Body, Controller, Post } from '@nestjs/common';
import { TranslateService } from './translate.service';
import { TranslateRequestDto } from './dto/translate-request.dto';
import { TranslateResponseDto } from './dto/translate-response.dto';

@Controller('translate')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Post()
  public async translate(@Body() body: TranslateRequestDto): Promise<TranslateResponseDto> {
    return this.translateService.translate(body);
  }
}
