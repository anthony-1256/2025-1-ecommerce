/* notification.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  tap,
  throwError
} from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly baseUrl = `${ environment.baseUrl }/notifications`;

  private notificationSubject = new BehaviorSubject< Notification[] >( [] );

  public notifications$ = this.notificationSubject.asObservable();

  constructor(
    private httpClient: HttpClient
  ) {}

  /* mt: obtener todas las notificaciones */
  getNotifications(): Observable< Notification[] > {

    return this.httpClient
      .get< Notification[] >( this.baseUrl )
      .pipe(
        tap(( notifications ) => {
          this.notificationSubject.next( notifications ?? [] );
        }),
        map(( notifications ) => notifications ?? [] ),
        catchError(( error ) => {

          console.error(
            '[ NotificationService ] Error en getNotifications:',
            error
          );

          this.notificationSubject.next([]);

          return of([]);
        })
      );

  } /* end getNotifications */

  /* mt: obtener notificación por id */
  getNotificationById( id: string ): Observable< Notification > {

    return this.httpClient
      .get< Notification >( `${ this.baseUrl }/${ id }` )
      .pipe(
        catchError(( error ) => {

          console.error(
            '[ NotificationService ] Error en getNotificationById:',
            error
          );

          return throwError(() => error );
        })
      );

  } /* end getNotificationById */

  /* mt: obtener notificaciones por usuario */
  getNotificationsByUser(
    userId: string
  ): Observable< Notification[] > {

    return this.httpClient
      .get< Notification[] >(
        `${ this.baseUrl }/user/${ userId }`
      )
      .pipe(
        map(( notifications ) => notifications ?? [] ),
        catchError(( error ) => {

          console.error(
            '[ NotificationService ] Error en getNotificationsByUser:',
            error
          );

          return of([]);
        })
      );

  } /* end getNotificationsByUser */

  /* mt: obtener notificaciones no leídas */
  getUnreadNotificationsByUser(
    userId: string
  ): Observable< {
    count: number;
    notifications: Notification[];
  }> {

    return this.httpClient
      .get< {
        count: number;
        notifications: Notification[];
      }>(
        `${ this.baseUrl }/unread/${ userId }`
      )
      .pipe(
        catchError(( error ) => {

          console.error(
            '[ NotificationService ] Error en getUnreadNotificationsByUser:',
            error
          );

          return throwError(() => error );
        })
      );

  } /* end getUnreadNotificationsByUser */

  /* mt: crear notificación */
  createNotification(
    notification: Partial< Notification >
  ): Observable< Notification > {

    return this.httpClient
      .post< Notification >(
        this.baseUrl,
        notification
      )
      .pipe(
        tap(( newNotification ) => {

          const currentNotifications =
            this.notificationSubject.value ?? [];

          this.notificationSubject.next([
            ...currentNotifications,
            newNotification
          ]);

        }),
        catchError(( error ) => {

          console.error(
            '[ NotificationService ] Error en createNotification:',
            error
          );

          return throwError(() => error );
        })
      );

  } /* end createNotification */

  /* mt: actualizar notificación */
  updateNotification(
    id: string,
    notification: Partial< Notification >
  ): Observable< Notification > {

    return this.httpClient
      .put< Notification >(
        `${ this.baseUrl }/${ id }`,
        notification
      )
      .pipe(
        tap(( updatedNotification ) => {

          const updatedNotifications =
            ( this.notificationSubject.value ?? [] ).map(
              notificationItem =>

                notificationItem._id === updatedNotification._id
                  ? updatedNotification
                  : notificationItem
            );

          this.notificationSubject.next(
            updatedNotifications
          );

        }),
        catchError(( error ) => {

          console.error(
            '[ NotificationService ] Error en updateNotification:',
            error
          );

          return throwError(() => error );
        })
      );

  } /* end updateNotification */

  /* mt: marcar notificación como leída */
  markAsRead(
    id: string
  ): Observable< Notification > {

    return this.httpClient
      .patch< {
        message: string;
        notification: Notification;
      }>(
        `${ this.baseUrl }/${ id }/mark-read`,
        {}
      )
      .pipe(
        map(( response ) => response.notification ),
        tap(( updatedNotification ) => {

          const updatedNotifications =
            ( this.notificationSubject.value ?? [] ).map(
              notificationItem =>

                notificationItem._id === updatedNotification._id
                  ? updatedNotification
                  : notificationItem
            );

          this.notificationSubject.next(
            updatedNotifications
          );

        }),
        catchError(( error ) => {

          console.error(
            '[ NotificationService ] Error en markAsRead:',
            error
          );

          return throwError(() => error );
        })
      );

  } /* end markAsRead */

  /* mt: marcar todas como leídas */
  markAllAsReadByUser(
    userId: string
  ): Observable< {
    message: string;
    modifiedCount: number;
  }> {

    return this.httpClient
      .patch< {
        message: string;
        modifiedCount: number;
      }>(
        `${ this.baseUrl }/user/${ userId }/mark-all-read`,
        {}
      )
      .pipe(
        catchError(( error ) => {

          console.error(
            '[ NotificationService ] Error en markAllAsReadByUser:',
            error
          );

          return throwError(() => error );
        })
      );

  } /* end markAllAsReadByUser */

  /* mt: eliminar notificación */
  deleteNotification(
    id: string
  ): Observable< void > {

    return this.httpClient
      .delete< void >(
        `${ this.baseUrl }/${ id }`
      )
      .pipe(
        tap(() => {

          const filteredNotifications =
            ( this.notificationSubject.value ?? [] )
              .filter(
                notification =>
                  notification._id !== id
              );

          this.notificationSubject.next(
            filteredNotifications
          );

        }),
        catchError(( error ) => {

          console.error(
            '[ NotificationService ] Error en deleteNotification:',
            error
          );

          return throwError(() => error );
        })
      );

  } /* end deleteNotification */

} /* end NotificationService */