import { inject, Injectable } from '@angular/core';
import { ToastController } from "@ionic/angular/standalone";
import { Color } from "@ionic/core"
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastController = inject(ToastController);
  private translate = inject(TranslateService);

  public async open(message: string, opt: { duration?: number, icon?: string, color?: Color } = { duration: 3000 }) {
    const toast = await this.toastController.create({ color: opt.color, message: this.translate.instant(message), buttons: [{ role: 'cancel', icon: 'close' }], duration: opt.duration, icon: opt.icon });
    await toast.present();
  }
}