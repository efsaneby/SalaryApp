import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  email: string | null = null;
  isAdmin = true;
  constructor(private router: Router, public authService: AuthService) { }

  get isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    this.email = localStorage.getItem('email');
    return !!token;
  }

 logout() {
    this.authService.logout;
  }
}
