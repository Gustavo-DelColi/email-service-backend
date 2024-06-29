// DESCRIBE ->   bloco tests - tests suites
// IT or TEST -> declara unico teste unitario - tests cases
// EXPECT -> asserções do resultado - validar resultados
const EmailController = require('../EmailController');
const EmailQueue = require('../../queue/MailQueue');

jest.mock('../../queue/MailQueue');

process.env.EMAIL_FROM = 'teste@example.com'

describe("EmailController", ()=> {
    beforeEach(()=> {
        jest.clearAllMocks();
    });

    test("shold sent email successfully", async() => {
       const request = {
            body: {
                email: "teste@example.com",
                firstName: "John",
                lastName: "hill",
            },
       };
       
       const reply = {
           code: jest.fn().mockReturnThis(),
           send: jest.fn()
        };
        
        const template = `
        Olá ${request.body.firstName} ${request.body.lastName}, sua assinatura foi confirmada!
        Para acessar seus recursos exclusivos você precisa basta clicar aqui.
        `

      await EmailController.sendEmail(request, reply);

      expect(EmailQueue.add).toHaveBeenCalledTimes(1);
      expect(EmailQueue.add).toHaveBeenCalledWith({
        to: "teste@example.com",
        from: process.env.EMAIL_FROM,
        subject: "Assinatura Confirmada",
        text: template
      });
      expect(reply.code).toHaveBeenCalledWith(200);
      
    })


    test("should return erre when not sent email", async() => {
       const request = {
            body: {
                email: "teste@example.com",
                firstName: "John",
                lastName: "hill",
            }
       }

       
       const reply = {
           code: jest.fn().mockReturnThis(),
           send: jest.fn()
        }
        
        EmailQueue.add.mockRejectedValue(new Error("Mocking Exception"));

      await EmailController.sendEmail(request, reply);

      expect(EmailQueue.add).toHaveBeenCalledTimes(1);
      expect(reply.code).toHaveBeenCalledWith(500);
      expect(reply.send).toHaveBeenCalledWith("Internal Server Error");
    })
})