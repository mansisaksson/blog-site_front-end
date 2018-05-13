import { User } from '../../_models/user'
import { Observable } from 'rxjs/Observable';
import { toPromise } from 'rxjs/operator/toPromise'

export class UserRepository {
  users: User[];

  constructor() {
    this.users = JSON.parse(localStorage.getItem('users')) || [];
  }

  getAllUsers():Promise<User[]> {
    return new Promise<User[]>((resolve, reject) => {
      resolve(this.users);
    })
  }

  findUser(userId:number):Promise<User> {
    return new Promise<User>((resolve, reject) => {
      let filteredUsers = this.users.filter(user => {
        return user.id === userId;
      });
  
      if (filteredUsers.length) {
        resolve(filteredUsers[0]);
      }
  
      reject("Could not find user")
    })
  }

  findUserByName(username:string):Promise<User> {
    return new Promise<User>((resolve, reject) => {
      let filteredUsers = this.users.filter(user => {
        return user.username === username;
      });
  
      if (filteredUsers.length > 0) {
        resolve(filteredUsers[0]);
      }

      reject("Could not find user")
    })
  }

  addUser(user:User):Promise<User> {
    return new Promise<User>((resolve, reject) => { 
      let newUser = user;
      // validation
      let duplicateUser = this.users.filter(user => { return user.username === newUser.username; }).length;
      if (duplicateUser) {
        reject('Username "' + newUser.username + '" is already taken');
      }

      // save new user
      newUser.id = this.users.length + 1;
      this.users.push(newUser);
      localStorage.setItem('users', JSON.stringify(this.users));

      resolve(newUser);
    })
  }

  removeUser(userId:number):Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      for (let i = 0; i < this.users.length; i++) {
        let user = this.users[i];
        if (user.id === userId) {
            this.users.splice(i, 1);
            localStorage.setItem('users', JSON.stringify(this.users));
            resolve(true)
        }
      }
      reject("Could not find user")
    })
  }

}
