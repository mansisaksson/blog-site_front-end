import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service'

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  name:string;
  age:number;
  email:string;
  address:Address;
  hobbies:string[];
  posts:Post[];

  isEdit:boolean = false;

  constructor(private dataService:DataService) { 
    
  }

  ngOnInit() {
    this.name = "Jon Doe"
    this.age = 30
    this.email = "coold@dude.com"
    this.address = {
      street:"50 Main st",
      city:"Boston",
      state:"MA"
    }
    this.hobbies = ["thing1", "thing2", "thing3"]

    this.dataService.getPosts().subscribe((posts: Post[]) => {
      this.posts = posts;
    });
  }

  onClick() {
    console.log("hello")
    this.name="Coolman 69"
    this.hobbies.push("thing4")
  }

  addHobby(hobby){
    console.log(hobby)
    this.hobbies.unshift(hobby)
    return false;
  }
  
  deleteHobby(hobbyIndex:number) {
    this.hobbies.splice(hobbyIndex)
  }

  toggleEdit() {
    this.isEdit = !this.isEdit;
  }

}

interface Address{
  street:string;
  city:string;
  state:string;
}

interface Post {
  userId: number,
  id: number,
  title: string,
  body: string
}