import { Test, TestingModule } from '@nestjs/testing';
import { SaleDigitalService } from './sale-digital.service';

describe('SaleDigitalService', () => {
  let service: SaleDigitalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaleDigitalService],
    }).compile();

    service = module.get<SaleDigitalService>(SaleDigitalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
