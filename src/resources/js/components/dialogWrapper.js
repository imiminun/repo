import Dialog from './dialog';

class DialogWrapper {
  constructor(options = {}) {
    this._options = options;

    this._element = document.createElement('div');
    this._instance = null;
    this._template = this._createTemplate(this._options);
    this._element.classList.add('modal', 'modal--alert');
    this._element.setAttribute('role', 'alertdialog');
    this._element.innerHTML = this._template;

    document.body.append(this._element);

    this._instance = new Dialog(this._element, {
      animate: true,
      destroy: true,
    });
    return this;
  }

  getElement() {
    return this._element;
  }

  _createTemplate(options) {
    if (!options || options.message === '') return;
    return `
      <div class="modal__overlay"></div>
      <div class="modal__content">
        <section>
          <div class="modal__body">
            <button type="button" class="modal__btn-close" data-dialog-close>팝업 닫기</button>
            <div class="alert-mes">${options.message}</div>
          </div>
          ${
            options.dialog === 'alert'
              ? `<div class="modal__footer">
                  <button type="button" class="btn btn--lg btn--dark" data-dialog-close>확인</button>
                </div>`
              : `<div class="modal__footer">
                <button type="button" class="btn btn--lg btn--gray" data-dialog-close>취소</button>
                <button type="button" class="btn btn--lg btn--dark" data-dialog-confirm>확인</button>
              </div>`
          }
        </section>
      </div>`;
  }

  open() {
    this._instance.open();
  }

  close() {
    this._instance.close();
  }
}

export default DialogWrapper;
