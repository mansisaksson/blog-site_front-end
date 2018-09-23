import { Component, OnInit } from '@angular/core'
import { User } from '../../_models'
import { AuthenticationService, UserService, AlertService, DynamicForm, UIService, FormValues } from '../../_services'
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms'
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  public user: User = new User()
  public registerForm: FormGroup
  public submitted = false
  public loading = false

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private alertService: AlertService,
    private uiService: UIService,
    private router: Router) {

  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      userName: ['', [Validators.required, Validators.pattern(environment.userNameRegex)]],
      password: ['', [Validators.pattern(environment.userPasswordRegex)]],
      confirmPassword: ['']
    }, {
        validator: EditUserComponent.MatchPassword
      })

    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      if (!this.user) {
        this.user = new User()
      }

      this.registerForm.get('userName').setValue(this.user.username)
    })
  }

  static MatchPassword(AC: AbstractControl) {
    let password = AC.get('password').value
    let confirmPassword = AC.get('confirmPassword').value
    if (password != confirmPassword) {
      AC.get('confirmPassword').setErrors({ MatchPassword: true })
    } else {
      AC.get('confirmPassword').setErrors(undefined)
      return null
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls }

  onSubmit() {
    this.submitted = true

    if (this.registerForm.invalid) {
      return
    }

    let update: boolean = false
    let userName = this.registerForm.get('userName').value != this.user.username ? this.registerForm.get('userName').value : undefined
    let password = this.registerForm.get('password').value != '' ? this.registerForm.get('password').value : undefined

    let newUserProperties = {}
    if (userName) {
      update = true
      newUserProperties['username'] = userName
    }
    if (password) {
      update = true
      newUserProperties['password'] = password
    }

    if (update) {
      this.loading = true
      this.userService.updateUser(this.user.id, newUserProperties).then((user: User) => {
        this.submitted = false
        this.loading = false
        this.authService.setUserSession(user)
        this.alertService.success("User updated!")
      }).catch(e => {
        this.alertService.error(e)
      })
    } else {
      this.submitted = false
    }
  }

  onDeleteUser() {
    let form: DynamicForm = new DynamicForm("Delete User", "Delete")
    form.addLabel('warning_text', "Warning!, this cannot be undone!", 'red')
    form.addPasswordInput('Please enter your password', "user_password")

    let onSubmit = (FormValues: FormValues, closeForm, showFormError) => {
      let password = FormValues['user_password']
      this.userService.delete(this.user.id, password).then(() => {
        closeForm()
        this.alertService.success('User Removed!')
        this.authService.setUserSession(undefined)
        this.router.navigate([''])
      }).catch(e => {
        showFormError(e)
      })
    }
    this.uiService.promptForm(form, false, onSubmit)
  }
}
