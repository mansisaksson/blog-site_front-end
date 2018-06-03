import { User } from '../../_models/user'
import { toPromise } from 'rxjs/operator/toPromise'

export class UserRepository {
  users: User[];

  constructor() {
    this.users = JSON.parse(localStorage.getItem('users')) || [];
  }

  getAllUsers(): Promise<User[]> {
    return new Promise<User[]>((resolve, reject) => {
      resolve(this.users);
    })
  }

  findUser(userId: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      let filteredUsers = this.users.filter(user => {
        return user.id === userId;
      });

      if (filteredUsers.length) {
        return resolve(filteredUsers[0]);
      }

      reject("Could not find user")
    })
  }

  findUserByName(username: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      let filteredUsers = this.users.filter(user => {
        return user.username === username;
      });

      if (filteredUsers.length > 0) {
        return resolve(filteredUsers[0]);
      }

      reject("Could not find user")
    })
  }

  addUser(user: User): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      let newUser = user;
      // validation
      let duplicateUser = this.users.filter(user => { return user.username === newUser.username; }).length;
      if (duplicateUser) {
        return reject('Username "' + newUser.username + '" is already taken');
      }

      // save new user
      newUser.id = (this.users.length + 1).toString();
      this.users.push(newUser);
      localStorage.setItem('users', JSON.stringify(this.users));

      resolve(newUser);
    })
  }

  removeUser(userId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      for (let i = 0; i < this.users.length; i++) {
        let user = this.users[i];
        if (user.id === userId) {
          this.users.splice(i, 1);
          localStorage.setItem('users', JSON.stringify(this.users));
          return resolve(true)
        }
      }
      reject("Could not find user")
    })
  }

}
