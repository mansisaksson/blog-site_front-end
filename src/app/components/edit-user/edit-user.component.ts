import { Component, OnInit } from '@angular/core'
import { User } from '../../_models'
import { AuthenticationService } from '../../_services'
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms'

@Component({
  selector: 'edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  private registerForm: FormGroup
  private submitted = false
  private user: User = new User()

  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder) {

  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validator: EditUserComponent.MatchPassword
    })

    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      if (!this.user) {
        this.user = new User()
      }
    })
  }

  static MatchPassword(AC: AbstractControl) {
    let password = AC.get('password').value
    let confirmPassword = AC.get('confirmPassword').value
    if (password != confirmPassword) {
      AC.get('confirmPassword').setErrors({ MatchPassword: true })
    } else {
      return null
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls }

  onSubmit() {
    this.submitted = true

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return
    }

    alert('SUCCESS!! :-)')
  }

}
