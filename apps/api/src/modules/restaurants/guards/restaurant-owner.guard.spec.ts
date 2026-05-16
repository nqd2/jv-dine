import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RestaurantsRepository } from '../restaurants.repository';
import { RestaurantOwnerGuard } from './restaurant-owner.guard';

describe('RestaurantOwnerGuard', () => {
  const restaurantsRepository = {
    findById: jest.fn(),
  } as unknown as RestaurantsRepository;

  const guard = new RestaurantOwnerGuard(restaurantsRepository);

  function createContext(
    userId: number,
    restaurantId: string,
  ): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId, roleName: 'OWNER' },
          params: { id: restaurantId },
        }),
      }),
    } as ExecutionContext;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows the restaurant owner', async () => {
    (restaurantsRepository.findById as jest.Mock).mockResolvedValue({
      id: 3,
      ownerId: 9,
    });

    await expect(guard.canActivate(createContext(9, '3'))).resolves.toBe(true);
  });

  it('forbids a different owner', async () => {
    (restaurantsRepository.findById as jest.Mock).mockResolvedValue({
      id: 3,
      ownerId: 9,
    });

    await expect(
      guard.canActivate(createContext(2, '3')),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
