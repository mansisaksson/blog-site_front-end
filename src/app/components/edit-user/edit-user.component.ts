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
  
  private profilePicture: File = null
  private banner: File = null

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
      displayName: ['', Validators.maxLength(40)],
      description: ['', Validators.maxLength(100)],
      password: ['', [Validators.pattern(environment.userPasswordRegex)]],
      confirmPassword: [''],
      profilePicture: [<File>null],
      banner: [null],
    }, {
      validator: EditUserComponent.MatchPassword
    })

    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      if (!this.user) {
        this.user = new User()
      }
      this.uiService.setBannerURI(this.user.bannerURI)
      this.registerForm.get('userName').setValue(this.user.username)
      this.registerForm.get('displayName').setValue(this.user.displayName)
      this.registerForm.get('description').setValue(this.user.description)
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

  uploadProfilePicture(event) {
    this.profilePicture = (event.target as HTMLInputElement).files[0];
  }

  uploadBanner(event) {
    this.banner = (event.target as HTMLInputElement).files[0];
  }

  async updateUser() {
    this.submitted = true

    if (this.registerForm.invalid) {
      return
    }

    let userName = this.registerForm.get('userName').value != this.user.username ? this.registerForm.get('userName').value : undefined
    let displayName = this.registerForm.get('displayName').value != this.user.displayName ? this.registerForm.get('displayName').value : undefined
    let description = this.registerForm.get('userName').value != this.user.description ? this.registerForm.get('description').value : undefined

    let password = this.registerForm.get('password').value != '' ? this.registerForm.get('password').value : undefined

    let profilePicture = this.profilePicture
    let banner = this.banner

    let newUserProperties = {}
    if (userName) {
      newUserProperties['username'] = userName
    }
    if (displayName) {
      newUserProperties['displayName'] = displayName
    }
    if (description) {
      newUserProperties['description'] = description
    }
    if (password) {
      newUserProperties['password'] = password
    }

    function getImageData(filePath): Promise<string> {
      return new Promise<string>((resolve) => {
        let file = <File>filePath
        if (file) {
          let fileReader = new FileReader()
          fileReader.onload = (e) => {
            resolve(btoa(<string>fileReader.result))
          }
          fileReader.readAsBinaryString(file)
        } else {
          resolve(undefined)
        }
      })
    }
    if (profilePicture) {
      newUserProperties['profilePicture'] = await getImageData(profilePicture)
    }
    if (banner) {
      newUserProperties['banner'] = await getImageData(banner)
    }

    if (Object.keys(newUserProperties).length > 0) {
      this.loading = true
      this.userService.updateUser(this.user.id, newUserProperties).then((user: User) => {
        this.submitted = false
        this.loading = false
        this.authService.setUserSession(user)
        this.alertService.success("User updated!")
      }).catch(e => {
        this.submitted = false
        this.loading = false
        this.alertService.error(e)
      })
    } else {
      this.submitted = false
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls }

  onSubmit() {
    this.updateUser()
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
