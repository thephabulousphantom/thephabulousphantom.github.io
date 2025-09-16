export class InstallPromptManager {
  constructor(bannerId, installBtnId, dismissBtnId) {
    this.banner = document.getElementById(bannerId) || null;
    this.installButton = document.getElementById(installBtnId) || null;
    this.dismissButton = document.getElementById(dismissBtnId) || null;

    this._deferredPrompt = null;

    this._onBeforeInstallPrompt = this.onBeforeInstallPrompt.bind(this);
    this._onAppInstalled = this.onAppInstalled.bind(this);
    this._onClickInstall = this.onClickInstall.bind(this);
    this._onClickDismiss = this.onClickDismiss.bind(this);
  }

  init() {
    if (this.installButton) {
      this.installButton.addEventListener("click", this._onClickInstall);
    }

    if (this.dismissButton) {
      this.dismissButton.addEventListener("click", this._onClickDismiss);
    }

    window.addEventListener("beforeinstallprompt", this._onBeforeInstallPrompt);
    window.addEventListener("appinstalled", this._onAppInstalled);
  }

  get dismissedForSession() {
    try {
      return sessionStorage.getItem("installDismissed") === "1";
    } catch (e) {
      return false;
    }
  }

  set dismissedForSession(val) {
    try {
      if (val) {
        sessionStorage.setItem("installDismissed", "1");
      } else {
        sessionStorage.removeItem("installDismissed");
      }
    } catch (e) {
    }
  }

  showBanner() {
    if (this.banner) {
      this.banner.hidden = false;
    }
  }

  hideBanner() {
    if (this.banner) {
      this.banner.hidden = true;
    }
  }

  onBeforeInstallPrompt(e) {
    e.preventDefault();
    this._deferredPrompt = e;

    if (!this.dismissedForSession) {
      this.showBanner();
    }
  }

  async onClickInstall() {
    if (!this._deferredPrompt) {
      this.hideBanner();
      return;
    }

    try {
      const promptEvent = this._deferredPrompt;
      this._deferredPrompt = null;
      promptEvent.prompt();
      const outcome = await promptEvent.userChoice;
      if (outcome && outcome.outcome === "accepted") {
        this.hideBanner();
      } else {
        this.dismissedForSession = true;
        this.hideBanner();
      }
    } catch (err) {
      this.dismissedForSession = true;
      this.hideBanner();
    }
  }

  onClickDismiss() {
    this.dismissedForSession = true;
    this.hideBanner();
    this._deferredPrompt = null;
  }

  onAppInstalled() {
    this.hideBanner();
    this._deferredPrompt = null;
    this.dismissedForSession = true;
  }

  destroy() {
    window.removeEventListener("beforeinstallprompt", this._onBeforeInstallPrompt);
    window.removeEventListener("appinstalled", this._onAppInstalled);
    if (this.installButton) {
      this.installButton.removeEventListener("click", this._onClickInstall);
    }
    if (this.dismissButton) {
      this.dismissButton.removeEventListener("click", this._onClickDismiss);
    }
  }
}