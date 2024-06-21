import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ILogin } from "./login/auth.model";
import { SessionService } from "./shared/services/session.service";


@Injectable()
export class RequestInterceptor implements HttpInterceptor {

    session: ILogin;
    constructor(private sessionService: SessionService) {
    }
    intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
            this.session = this.sessionService.getData();
            if (this.session != null) {
                httpRequest = httpRequest.clone({
                    setHeaders: {
                        sessionId: this.session.sessionId.toString(),
                    }
                })
            }
            return next.handle(httpRequest);
    }


}