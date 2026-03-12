export interface UserRepositoryFindByIdResult {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface UserRepository {
  findById(userId: string): Promise<UserRepositoryFindByIdResult | null>;
}
