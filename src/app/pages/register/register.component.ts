import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';

  // Dependency injections
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.initializeRegisterForm();
  }

  // Initialize the register form
  initializeRegisterForm(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      roles: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      mobile: ['', [ Validators.pattern(/^\d{10}$/)]],
    });
  }

  // Error getters
  get nameError(): string {
    const control = this.registerForm.get('name');
    return control?.touched && control?.errors ? 'Full Name is required (min 3 characters)' : '';
  }

  get rolesError(): string {
    const control = this.registerForm.get('roles');
    return control?.touched && control?.errors ? 'Role is required' : '';
  }

  get emailError(): string {
    const control = this.registerForm.get('email');
    return control?.touched && control?.errors ? 'Valid email is required' : '';
  }

  get passwordError(): string {
    const control = this.registerForm.get('password');
    return control?.touched && control?.errors ? 'Password must be at least 6 characters long' : '';
  }

  get mobileNumberError(): string {
    const control = this.registerForm.get('mobile');
    return control?.touched && control?.errors ? 'Enter a valid 10-digit mobile number' : '';
  }

  // Handle registration
  onRegister(): void {
    console.log(this.registerForm.value);

    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log(response);
          Swal.fire({
            position: "top-end",
            icon: 'success',
            title: 'Registration Successful',
            text: ' You can now log in with your credentials!',
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          console.error("Error registering user:", err);
        
          // Default error message
          let errorMessage = "Registration Failed! Email already Exists / Invalid Credentials";
        
          // Handle specific backend errors
          if (err.status === 400) {
            errorMessage = err.error?.error || "Invalid input. Please check your details.";
          } else if (err.status === 500) {
            errorMessage = "Something went wrong on our end. Please try again later.";
          }
        
          // Show error in toast
          Swal.fire({
            position: "top-end",
            icon: 'error',
            title: 'Registration Failed',
            text: errorMessage,  // Display backend error message
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
        
          this.errorMessage = errorMessage;
        }
        
      });
    } else {
      this.registerForm.markAllAsTouched();
      Swal.fire({
        position: "top-end",
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Please correct the highlighted errors before submitting.',
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    }
  }

  onregister(){
    this.router.navigate(['/register'])
  }
}