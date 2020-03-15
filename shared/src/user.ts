export interface User {
  name: string;
  age: number;
}

export const createUser = (name: string, age: number): User => ({ name, age });

export const showUser = (user: User) => console.log(`${user.name} is ${user.age} years old.`);
