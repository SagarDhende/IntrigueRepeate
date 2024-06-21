import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { CarouselModule } from 'primeng/carousel';
import { DividerModule } from 'primeng/divider';

import { GoogleLoginProvider, SocialLoginModule, SocialAuthServiceConfig} from '@abacritt/angularx-social-login';
import { AppConfigService } from '../app-config.service';
import { GoogleSigninComponent } from './google-signin/google-signin.component';

@NgModule({
  declarations: [LoginComponent,GoogleSigninComponent],
  imports: [
    CommonModule,
    LoginRoutingModule,
    FormsModule,  
    ReactiveFormsModule,
    CarouselModule,
    ButtonModule,
    DividerModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    MessagesModule,
    SocialLoginModule,
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              new AppConfigService(document).getSocialSso().googleAuthClientId
            )
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    }
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginModule { }
