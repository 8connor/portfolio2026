(function () {
  emailjs.init("user_tssWZv8azwNWJGRvDkwsl");
})();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  document.getElementById("contact_form").addEventListener("submit", (e) => {
    e.preventDefault();

    this.contactNum.value = (Math.random() * 100000) | 0;

    emailjs
      .sendForm("service_no22119", "template_fbgakbo", "#contact_form")
      .then(
        function (res) {
          console.log(res.status);

          if (res.status === 200) {
            console.log("success");

            var frm = document.getElementById("contact_form");
            frm.reset();

            document.getElementById('contact-inputs').style.display = 'none';
            document.getElementById('thank-you').style.display = 'block';

            return false;
          }
        },
        function (error) {
          console.log("FAILED...", error);
        }
      );
  });
});
