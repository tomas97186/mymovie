// long-press.directive.ts
import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[longPress]',
})
export class LongPressDirective {
  @Output() longPress = new EventEmitter<void>();
  private timeout: any;

  @HostListener('mousedown') onMouseDown() {
    this.startPress();
  }
  @HostListener('touchstart') onTouchStart() {
    this.startPress();
  }

  @HostListener('mouseup') onMouseUp() {
    this.endPress();
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.endPress();
  }
  @HostListener('touchend') onTouchEnd() {
    this.endPress();
  }

  private startPress() {
    this.timeout = setTimeout(() => {
      this.longPress.emit();
    }, 600);
  }

  private endPress() {
    clearTimeout(this.timeout);
  }
}
