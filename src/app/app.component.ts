import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { SessionService } from './shared/services/session.service';
import { CommonService } from './shared/services/common.service';
import { SubjectService } from './shared/services/subject.service';
import { MetaType } from './shared/enums/api/meta-type.enum';
import { Subscriber, Subscription } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    private subscriptions: Subscription[] = [];
    constructor(private primengConfig: PrimeNGConfig, private sessionService: SessionService, private commonService: CommonService,
        private subjectService: SubjectService) {
    }

    ngOnInit() {
        this.primengConfig.ripple = true;
        const sessionDetail = this.sessionService.getData();
        if (sessionDetail) {
            this.getApplication(sessionDetail.appId);
        }
    }
    private getApplication(uuid: string): void {
        const observableTemp = this.commonService.getOnyByUuidAndVersion(MetaType.APPLICATION, uuid, null).subscribe({
            next: (response: any) => {
                this.subjectService.application$.next(response);
            },
            complete: () => {
                observableTemp.unsubscribe();
            }
        })
    }


    private addSubscribe(subscriber: any): void {
        if (subscriber != null && subscriber instanceof Subscriber) {
            this.subscriptions.push(subscriber);
        }
    }

    ngOnDestroy() {
        //Method used for unsubscribing observables
        for (let subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }
}
