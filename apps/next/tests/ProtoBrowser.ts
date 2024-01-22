const { chromium, firefox, webkit } = require('playwright');
const HOST_URL = 'http://localhost:8080/'

export class ProtoBrowser {
    browser: any;
    page: any;
    constructor(browser: any) {
        this.browser = browser
    }

    static async __newInstance__(): Promise<ProtoBrowser> {
        const brwsr = await chromium.launch();  // Or 'firefox' or 'webkit'.
        const context = await brwsr.newContext({
            viewport: { width: 1920, height: 1080 } // Set the viewport size
        });
        const page = await context.newPage();
        await page.goto(HOST_URL);
        return new ProtoBrowser(brwsr)
    }

    async close() {
        await this.browser.close();
    }

    getContext(context?: number) { // Returns first context as default
        return this.browser.contexts()[context ?? 0]
    }

    getPages(context?: number) { // Returns pages of first context as default
        return this.getContext(context).pages()
    }

    getPage(context?: number, page?: number) { // Returns first page of first context as default
        return this.getPages(context)[page ?? 0]
    }

    getBrowser() {
        return this.browser;
    }

    async getUrlPath(): Promise<string> {
        return new URL(await this.getPage().url()).pathname;
    }

    async goTo(path: string) {
        if (path.startsWith('/')) {
            path = path.slice(1)
        }
        const page = this.getPage()
        await page.goto(HOST_URL+path)
    }

    async waitForElement(locator: string): Promise<any> {
        const page = this.getPage()
        await (page.locator(locator)).waitFor({timeout: 60000})
        return page.$(locator)
    }

    async clickElement(locator: any): Promise<any> {
        await this.waitForElement(locator)
        await this.getPage().click(locator)
    }

    async getElementText(selector: any): Promise<any> {
        await this.waitForElement(selector)
        return await this.getPage().textContent(selector);
    }

    async navigateToLogin() {
        await this.waitForElement('#header-login-link');
        const element = await this.getPage().$('#header-login-link > p');
        await element.click()
        await this.waitForElement('#sign-in-btn');
    }

    async navigateToRegister() {
        await this.navigateToLogin()
        await this.clickElement('#sign-up-link')
        await this.waitForElement('#sign-up-btn')
    }

    async navigateToWorkspace() {
        await this.waitForElement('#header-session-user-id');
        await this.clickElement('#layout-menu-btn')
        await this.clickElement('#pop-over-workspace-link')
        await this.getPage().waitForURL('**/admin/*', {timeout: 60000});
    }

    async signInSubmit(email: string, password: string) {
        // Fill sign-in form
        await this.waitForElement('#sign-in-email-input');
        await this.getPage().fill('#sign-in-email-input', email);
        await this.waitForElement('#sign-in-password-input');
        await this.getPage().fill('#sign-in-password-input', password);
        await this.clickElement('#sign-in-btn');
    }

    async signUpFlow(email: string, password: string) {
        // Fill sign-up form
        await this.waitForElement('#sign-up-email-input');
        await this.getPage().fill('#sign-up-email-input', email);
        await this.waitForElement('#sign-up-password-input');
        await this.getPage().fill('#sign-up-password-input', password);
        await this.waitForElement('#sign-up-repassword-input');
        await this.getPage().fill('#sign-up-repassword-input', password);
        await this.clickElement('#sign-up-btn')
        await this.waitForElement('#header-session-user-id');
        await this.waitForElement('#home-page');
    }

    async navigateToWorkspaceSection(entity: string) {
        await this.getPage().goto(HOST_URL + `admin/${entity}`);
    }

    async getEditableObjectCreate() {
        /*open create dialog */
        await this.clickElement('#admin-dataview-add-btn');
        await this.waitForElement('#admin-dataview-create-dlg');
        await this.waitForElement('#admin-eo');
    }

    async fillEditableObjectInput(field: string, value: string) {
        /*fill input */
        await this.waitForElement(`#editable-object-input-${field}`)
        await this.getPage().fill(`#editable-object-input-${field}`, value);
    }

    async fillEditableObjectSelect(field: string, option: string | number) {
        await this.clickElement(`xpath=//*[@id='eo-select-list-${field}']/../span/li`) // open selectable
        await this.clickElement(`xpath=//*[@id='eo-select-list-${field}-item-${option}']/..`)// click selectable option
    }

    async submitEditableObject() {
        await this.clickElement("xpath=//*[@id='admin-eo']/div/div/div/span/span/span/button")
    }

    async takeScreenshot(filename: string, context?: number, page?: number) {
        await this.getPage(context, page).screenshot({ path: filename, fullPage: false });
    }

}