import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Navbar } from "./navbar/navbar";
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  constructor(private authService: AuthService) {}


  ngOnInit(): void {
    this.authService.checkToken;

    setInterval(() => {
    this.authService.refreshAccessToken();
  }, 10 * 60 * 1000);
  }
  protected title = 'frontend';
}
