import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../core/services/auth.service';
import { errorMessages } from '../../constant';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  editMailForm!: FormGroup;
  private fb = inject(FormBuilder);
  private cdRef = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private router = inject(Router);
  showForgotPassword: boolean = false;
  forgotPasswordEmail: string = '';
  showPassword: boolean = false;


  emailError: string = '';
  passwordError: string = '';
  show2FA: boolean = false;
  showResend: boolean = false;
  timer: number = 0;
  interval: any;
  isLoading: boolean = false;
  loginEmail: string = '';

  ngOnInit() {
    this.initForm();
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      otp: [{ value: '', disabled: true }],
    });

    this.editMailForm = this.fb.group({
      emailEdit: ['', [Validators.email]]
    });
  }

  onSubmit() {
    if (this.show2FA) {
      this.verifyOTP();
    } else {
      this.initiateLogin();
    }
  }

  private initiateLogin() {
    this.loginForm.markAllAsTouched();
    this.loginForm.get('email')?.markAsDirty();
    this.loginForm.get('password')?.markAsDirty();

    // Reset previous error messages
    this.emailError = '';
    this.passwordError = '';

    if (this.loginForm.get('email')?.invalid) {
      this.emailError = 'Please enter a valid email address';
    }
    if (this.loginForm.get('password')?.invalid) {
      this.passwordError = 'Password is required';
    }

    // If there are errors, show a toast and stop login
    if (this.emailError || this.passwordError) {
      this.showToast('error', 'Invalid Input', 'Please check your email and password');
      return;
    }


    this.isLoading = true;
    this.loginEmail = this.loginForm.get('email')?.value;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        if (res.requiresOtp) {
          this.handle2FARequired();
        } else {
          this.handleLoginSuccess(res);
        }
      },
      error: (err) => {
        console.log(err);

        this.handleLoginError(err)
      },
      complete: () => this.isLoading = false
    });
  }

  private verifyOTP() {
    if (this.loginForm.get('otp')?.invalid) {
      this.showToast('warning', 'Invalid OTP', 'Please enter a valid OTP');
      return;
    }

    this.isLoading = true;
    const otpData = {
      email: this.loginEmail,
      twoFactorCode: this.loginForm.get('otp')?.value
    };

    this.authService.verifyOtp(otpData).subscribe({
      next: (res: any) => this.handleOTPSuccess(res),
      error: (err) => this.handleOTPError(err),
      complete: () => this.isLoading = false
    });
  }
  private handle2FARequired() {
    this.show2FA = true;
    this.loginForm.get('otp')?.enable();
    this.startTimer();

    // Save the email temporarily for OTP verification
    this.loginEmail = this.loginForm.get('email')?.value;

    // Check if this is an admin login attempt
    if (this.loginEmail === 'comsec@admin.com') {
      this.showToast('info', 'Admin OTP Sent', 'Please check your email for the verification code');
    } else {
      this.showToast('info', 'OTP Sent', 'Please check your email for the verification code');
    }

    this.cdRef.detectChanges();
  }

  private handleLoginSuccess(res: any) {
    console.log('res', res);

    // Store token in any case
    localStorage.setItem('token', res.token);

    // Check if it's a user login
    if (res.user) {
      localStorage.setItem('userId', res.user.id);
      localStorage.setItem('userRole', res.user.roles);

      if (res.user.roles === 'Admin') {
        this.showToast('success', 'Admin Login Successful', 'Welcome back!');
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.showToast('success', 'Login Successful', 'Welcome back!');
        this.router.navigate(['/user-dashboard']);
      }
    }
    // Check if it's a shareholder login
    else if (res.shareholder) {
      localStorage.setItem('userId', res.shareholder.id);
      localStorage.setItem('userRole', 'Shareholder');
      localStorage.setItem('shareholderData', JSON.stringify(res.shareholder));

      this.showToast('success', 'Shareholder Login Successful', 'Welcome back!');
      this.router.navigate(['/user-dashboard']);
    }
    else if (res.directive) {
      localStorage.setItem('userId', res.directive.id);
      localStorage.setItem('userRole', 'Shareholder');
      localStorage.setItem('shareholderData', JSON.stringify(res.directive));

      this.showToast('success', 'Directive Login Successful', 'Welcome back!');
      this.router.navigate(['/user-dashboard']);
    }
  }
  private handleOTPSuccess(res: any) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('userId', res.user.id);
    localStorage.setItem('userRole', res.user.roles);  // Store the user role

    if (res.user.roles === 'admin') {
      this.showToast('success', 'Admin Verification Successful', 'Logging you in...');
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.showToast('success', 'Verification Successful', 'Logging you in...');
      this.router.navigate(['/user-dashboard']);
    }
  }

  // private handleLoginError(err: any) {
  //   console.error('Login error:', err);
  //   this.isLoading = false;
  //   this.showToast('error', 'Login Failed', err.error?.message || 'Invalid credentials');
  //   this.cdRef.detectChanges();
  // }

  // private handleOTPError(err: any) {
  //   console.error('OTP verification error:', err);
  //   this.isLoading = false;
  //   this.showToast('error', 'Verification Failed', err.error?.message || 'Invalid OTP');
  //   this.cdRef.detectChanges();
  // }

  private showToast(icon: 'success' | 'error' | 'warning' | 'info', title: string, text: string) {
    Swal.fire({
      position: 'top-end',
      icon,
      title,
      text,
      toast: true,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
      // Add these properties to fix the clicking issue:
      allowOutsideClick: true,
      allowEscapeKey: true,
      allowEnterKey: true,
      backdrop: false // This is the key fix - removes the invisible overlay
    });
  }

  // Also modify your error handling methods to ensure they don't block the UI:
  private handleLoginError(err: any) {
    console.error('Login error:', err);
    this.isLoading = false; // Make sure to reset loading state
    this.showToast('error', 'Login Failed', err.message || 'An error occurred');
    this.cdRef.detectChanges(); // Force update the view
  }

  private handleOTPError(err: any) {
    console.error('OTP verification error:', err);
    this.isLoading = false; // Make sure to reset loading state
    this.showToast('error', 'Verification Failed', err.message || 'Invalid OTP');
    this.cdRef.detectChanges(); // Force update the view
  }

  // private showValidationToast() {
  //   this.isLoading = false; // Make sure loading state is reset
  //   this.showToast('warning', 'Invalid Form', 'Please fill out all required fields correctly');
  //   this.cdRef.detectChanges(); // Force update the view
  // }
  startTimer() {
    this.showResend = false;
    this.timer = 60;

    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.interval);
        this.showResend = true;
        this.cdRef.detectChanges();
      }
    }, 1000);
  }

  resendCode() {
    this.isLoading = true;
    this.authService.resendCode({ email: this.loginEmail }).subscribe({
      next: () => {
        this.showToast('success', 'Code Resent', 'A new OTP has been sent to your email');
        this.startTimer();
      },
      error: (err) => {
        this.showToast('error', 'Resend Failed', err.message || 'Unable to resend OTP');
      },
      complete: () => this.isLoading = false
    });
  }

  private initForgotPasswordForm(): void {
    this.editMailForm = this.fb.group({
      emailEdit: ['', [Validators.required, Validators.email]]
    });
  }

  // Add these methods to your LoginComponent class:

  toggleForgotPassword(): void {
    this.showForgotPassword = !this.showForgotPassword;
    if (!this.showForgotPassword) {
      this.editMailForm.reset();
    }
    this.cdRef.detectChanges();
  }

  handleForgotPassword(): void {
    // Mark fields as touched to trigger validation
    //this.editMailForm.markAllAsTouched();

    const emailControl = this.editMailForm.get('emailEdit');

    // Check for validation errors
    if (emailControl?.invalid) {
      if (emailControl?.errors?.['required']) {
        this.showToast('warning', 'Email Required', 'Please enter your email address');
      } else if (emailControl?.errors?.['email']) {
        this.showToast('warning', 'Invalid Email', 'Please enter a valid email address');
      }
      return;
    }

    const email = emailControl?.value;
    this.isLoading = true;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.showToast('success', 'Password Reset', 'Current password has been sent to your email');
        this.showForgotPassword = false;
        this.editMailForm.reset();
        this.cdRef.detectChanges();
      },
      error: (error) => {
        this.handleForgotPasswordError(error);
      },
      complete: () => {
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  private handleForgotPasswordError(error: any) {
    console.error('Password reset error:', error);
    this.isLoading = false;
    this.showToast('error', 'Reset Failed', error.message || 'Failed to process request');
    this.cdRef.detectChanges();
  }


}
