import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RestaurantsRepository } from './restaurants.repository';

describe('RestaurantsRepository', () => {
  let findMany: jest.Mock;
  let create: jest.Mock;
  let repository: RestaurantsRepository;

  beforeEach(() => {
    findMany = jest.fn().mockResolvedValue([]);
    create = jest.fn();
    repository = new RestaurantsRepository({
      restaurant: { findMany, create },
    } as unknown as PrismaService);
  });

  it('persists extended restaurant fields on create', async () => {
    create.mockResolvedValue({
      id: 1,
      owner_id: 2,
      name: 'JP',
      name_vn: 'VN',
      description_ja: 'dja',
      description_vn: 'dvn',
      address: 'addr',
      area: null,
      phone: '+84',
      cuisine: 'pho',
      working_hours: '9-17',
      min_budget: new Prisma.Decimal(100000),
      max_budget: new Prisma.Decimal(200000),
      has_air_conditioner: true,
      is_japanese_friendly: false,
      has_wifi: true,
      has_parking: false,
      has_english_support: true,
      accepts_cards: false,
      has_delivery: true,
      accepts_reservations: false,
      cleanliness_level: null,
      languages: null,
      lat: null,
      long: null,
      image_url: 'https://x.test/a.png',
    });

    await repository.create({
      ownerId: 2,
      name: 'JP',
      nameVn: 'VN',
      descriptionJa: 'dja',
      descriptionVn: 'dvn',
      address: 'addr',
      phone: '+84',
      cuisine: 'pho',
      workingHours: '9-17',
      minBudget: 100000,
      maxBudget: 200000,
      hasAirConditioner: true,
      isJapaneseFriendly: false,
      hasWifi: true,
      hasParking: false,
      hasEnglishSupport: true,
      acceptsCards: false,
      hasDelivery: true,
      acceptsReservations: false,
      imageUrl: 'https://x.test/a.png',
    });

    const createCalls = create.mock.calls as [
      { data: Record<string, unknown> },
    ][];
    const createArg = createCalls[0][0];
    expect(createArg.data).toMatchObject({
      owner_id: 2,
      name: 'JP',
      name_vn: 'VN',
      description_ja: 'dja',
      description_vn: 'dvn',
      phone: '+84',
      cuisine: 'pho',
      has_wifi: true,
      has_english_support: true,
      has_delivery: true,
      accepts_reservations: false,
    });
  });

  it('keyword search includes Vietnamese store name', async () => {
    await repository.search({ keyword: 'pho' });

    const where = whereFromFindMany();
    const orClause = (where.AND as Prisma.RestaurantWhereInput[])[0].OR;
    expect(orClause).toEqual(
      expect.arrayContaining([
        { name: { contains: 'pho', mode: 'insensitive' } },
        { name_vn: { contains: 'pho', mode: 'insensitive' } },
      ]),
    );
  });

  it('ignores an empty budgetMax query value', async () => {
    await repository.search({ budgetMax: '' });

    expect(findMany).toHaveBeenCalledWith({
      where: {},
      include: { reviews: { select: { rating: true } } },
      orderBy: { id: 'asc' },
    });
  });

  it('matches restaurants whose minimum budget is within budgetMax', async () => {
    await repository.search({ budgetMax: '500000' });

    const [filter] = andFilters(whereFromFindMany());
    const maxBudgetFilter = filter as {
      min_budget: { lte: Prisma.Decimal };
    };
    expect(maxBudgetFilter.min_budget.lte.toString()).toBe('500000');
  });

  it('matches restaurants whose maximum budget is within budgetMin', async () => {
    await repository.search({ budgetMin: '200000' });

    const [filter] = andFilters(whereFromFindMany());
    const minBudgetFilter = filter as {
      max_budget: { gte: Prisma.Decimal };
    };
    expect(minBudgetFilter.max_budget.gte.toString()).toBe('200000');
  });

  it('matches restaurants whose budget range overlaps the requested range', async () => {
    await repository.search({ budgetMin: '200000', budgetMax: '500000' });

    const [minFilter, maxFilter] = andFilters(whereFromFindMany()) as [
      { max_budget: { gte: Prisma.Decimal } },
      { min_budget: { lte: Prisma.Decimal } },
    ];
    expect(minFilter.max_budget.gte.toString()).toBe('200000');
    expect(maxFilter.min_budget.lte.toString()).toBe('500000');
  });

  it('accepts small budget inputs as thousand VND values', async () => {
    await repository.search({ budgetMin: '100', budgetMax: '6000' });

    const [minFilter, maxFilter] = andFilters(whereFromFindMany()) as [
      { max_budget: { gte: Prisma.Decimal } },
      { min_budget: { lte: Prisma.Decimal } },
    ];
    expect(minFilter.max_budget.gte.toString()).toBe('100000');
    expect(maxFilter.min_budget.lte.toString()).toBe('6000000');
  });

  function whereFromFindMany(): Prisma.RestaurantWhereInput {
    const [args] = findMany.mock.calls[0] as [
      { where: Prisma.RestaurantWhereInput },
    ];
    return args.where;
  }

  it('filters and sorts restaurants by geo radius', async () => {
    findMany.mockResolvedValue([
      {
        id: 1,
        owner_id: 1,
        name: 'Near',
        name_vn: null,
        description_ja: null,
        description_vn: null,
        address: 'a',
        area: null,
        phone: null,
        cuisine: null,
        working_hours: null,
        min_budget: null,
        max_budget: null,
        has_air_conditioner: false,
        is_japanese_friendly: false,
        has_wifi: false,
        has_parking: false,
        has_english_support: false,
        accepts_cards: false,
        has_delivery: false,
        accepts_reservations: false,
        cleanliness_level: null,
        languages: null,
        lat: 21.0285,
        long: 105.8542,
        image_url: null,
        reviews: [],
      },
      {
        id: 2,
        owner_id: 1,
        name: 'Far',
        name_vn: null,
        description_ja: null,
        description_vn: null,
        address: 'b',
        area: null,
        phone: null,
        cuisine: null,
        working_hours: null,
        min_budget: null,
        max_budget: null,
        has_air_conditioner: false,
        is_japanese_friendly: false,
        has_wifi: false,
        has_parking: false,
        has_english_support: false,
        accepts_cards: false,
        has_delivery: false,
        accepts_reservations: false,
        cleanliness_level: null,
        languages: null,
        lat: 21.5,
        long: 106.5,
        image_url: null,
        reviews: [],
      },
    ]);

    const results = await repository.search({
      lat: '21.0285',
      long: '105.8542',
      radiusKm: '5',
    });

    expect(results.map((r) => r.id)).toEqual([1]);
    expect(results[0].distanceKm).not.toBeNull();
  });

  function andFilters(
    where: Prisma.RestaurantWhereInput,
  ): Prisma.RestaurantWhereInput[] {
    return where.AND as Prisma.RestaurantWhereInput[];
  }
});
