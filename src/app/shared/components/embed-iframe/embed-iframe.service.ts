import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscriber, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmbedIFrameService {

  constructor(private http: HttpClient) { }


  getHTML(url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': "application/octet-stream",
        "X-Frame-Options": "*"
      }),
      observe: 'response' as 'body'
    };
    return new Observable((observer: Subscriber<any>) => {
      let objectUrl: string = null;
      this.http
        .get(url, httpOptions)
        .subscribe({
          next: (m: any) => {
            objectUrl = URL.createObjectURL(m["blob"]());
            observer.next(objectUrl);
          }
        });
      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
      };
    });
  }

  private handelError(error: HttpErrorResponse) {
    return throwError(() => error);
  }

}
