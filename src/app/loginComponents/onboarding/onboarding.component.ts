import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html'
})
export class OnboardingComponent implements OnInit {
  private curStep = 1;
  private tokenSetComplete;
  constructor(private tokenService: TokenService,
              private userService: UserService) {
  }
  ngOnInit() {
    localStorage.setItem('page', '/onboarding');
    this.userService.getUser().subscribe(
      user => {
        const tokenStatusSet =  this.tokenService.getUserTokenStatusSet(user.id);
        if (tokenStatusSet) {
          this.tokenSetComplete = tokenStatusSet.github;
        }
      }
    );
  }
  prevStep() {
    if (this.curStep > 1) {
      this.curStep--;
    }
  }
  nextStep() {
    if (this.tokenSetComplete) {
      return;
    }
    switch (this.curStep) {
      case 1:
      case 2:
        this.curStep++;
        break;
      default:
        localStorage.setItem('page', '/onboarding');
    }
  }

}
