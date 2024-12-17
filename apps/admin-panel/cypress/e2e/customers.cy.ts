describe("Customers", () => {
  let testEmail: string
  let testTelegramId: string
  let testCustomerId: string

  it("should successfully create a new customer", () => {
    testEmail = `test-${Date.now()}@example.com`
    testTelegramId = `user${Date.now()}`

    cy.visit("/customers")
    cy.takeScreenshot("2_list_all_customers")

    cy.get('[data-testid="global-create-button"]').click()
    cy.takeScreenshot("3_click_create_button")

    cy.get('[data-testid="customer-create-email"]').should("be.visible")
    cy.takeScreenshot("4_verify_email_input_visible")

    cy.get('[data-testid="customer-create-email"]')
      .type(testEmail)
      .should("have.value", testEmail)
    cy.takeScreenshot("5_enter_email")

    cy.get('[data-testid="customer-create-telegram-id"]')
      .type(testTelegramId)
      .should("have.value", testTelegramId)
    cy.takeScreenshot("6_enter_telegram_id")

    cy.get('[data-testid="customer-create-submit-button"]')
      .contains("Review Details")
      .click()
    cy.takeScreenshot("7_click_review_details")

    cy.contains(testEmail).should("be.visible")
    cy.contains(testTelegramId).should("be.visible")
    cy.takeScreenshot("8_verify_details")

    cy.get('[data-testid="customer-create-submit-button"]')
      .contains("Confirm and Submit")
      .click()
    cy.takeScreenshot("9_click_confirm_submit")

    cy.url().should(
      "match",
      /\/customers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    )
    cy.contains(testEmail).should("be.visible")
    cy.contains("Add new customer").should("not.exist")
    cy.takeScreenshot("10_verify_email")
    cy.getIdFromUrl("/customers/").then((id) => {
      testCustomerId = id
    })
  })

  it("should show newly created customer in the list", () => {
    cy.visit("/customers")
    cy.contains(testEmail).should("be.visible")
    cy.takeScreenshot("11_verify_customer_in_list")
  })

  it("should upload a document", () => {
    cy.visit(`/customers/${testCustomerId}/documents`)
    cy.contains("Documents uploaded by this customer").should("exist")
    cy.takeScreenshot("12_customer_documents")
    cy.fixture("test.pdf", "binary").then((content) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: content,
        fileName: "test.pdf",
        mimeType: "application/pdf",
      })
    })
    cy.contains("Document uploaded successfully").should("exist")
    cy.takeScreenshot("13_upload_document")
  })
})
