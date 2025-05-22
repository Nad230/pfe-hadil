import { Test, TestingModule } from '@nestjs/testing';
import { SaleDigitalController } from './sale-digital.controller';

describe('SaleDigitalController', () => {
  let controller: SaleDigitalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaleDigitalController],
    }).compile();

    controller = module.get<SaleDigitalController>(SaleDigitalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
