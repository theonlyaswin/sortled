var recData = JSON.parse(localStorage.getItem('order-data'));

console.log(recData)

var subtotal = 0;
var tbody = document.getElementById('product-lists');

document.getElementById('id').textContent = recData.orderId;
document.getElementById('name').textContent = recData.name;
document.getElementById('add1').textContent = recData.address + "," + recData.state;
document.getElementById('add2').textContent = recData.postalCode;
document.getElementById('phno').textContent = recData.phoneNumber;

for (let i = 0; i < recData.items.length; i++) {
  returnData = recData.items[i];
  var listTemplate = `
        <tr class="cart_item">
            <td class="product-name">
                (${returnData.name}) ${returnData.watts}<strong class="product-quantity"> × ${returnData.quantity}</strong>
            </td>
            <td class="product-total">
                <span class="amount">AED : ${returnData.price}</span>
            </td>
        </tr>
        `;
  subtotal = subtotal + Number(returnData.price);
  tbody.innerHTML = tbody.innerHTML + listTemplate;
  document.getElementById('cart-sub-tot').textContent = 'AED : ' + subtotal;
  var tot_amount = Number(subtotal);
  document.getElementById('order-tot').textContent = 'AED : ' + tot_amount;

}

function whatsapp() {
  const message = `Hi, an order from Sort LED Online Store\n` +
                    `Order ID: ${recData.orderId}\n`
  const whatsappUrl = `https://wa.me/+919074430171?text=${message}`;

  // Open WhatsApp link in a new tab
  window.open(whatsappUrl, '_blank');
}

(function ($) {
  'use strict';

  /*--------------------------------------------------------------
  ## Down Load Button Function
  ----------------------------------------------------------------*/
  $('#download_btn').on('click', function () {
    var downloadSection = $('#download_section');
    var cWidth = downloadSection.width();
    var cHeight = downloadSection.height();
    var topLeftMargin = 40;
    var pdfWidth = cWidth + topLeftMargin * 2;
    var pdfHeight = pdfWidth * 1.5 + topLeftMargin * 2;
    var canvasImageWidth = cWidth;
    var canvasImageHeight = cHeight;
    var totalPDFPages = Math.ceil(cHeight / pdfHeight) - 1;

    html2canvas(downloadSection[0], { allowTaint: true }).then(function (
      canvas
    ) {
      canvas.getContext('2d');
      var imgData = canvas.toDataURL('image/jpeg', 1.0);
      var pdf = new jsPDF('p', 'pt', [pdfWidth, pdfHeight]);
      pdf.addImage(
        imgData,
        'JPG',
        topLeftMargin,
        topLeftMargin,
        canvasImageWidth,
        canvasImageHeight
      );
      for (var i = 1; i <= totalPDFPages; i++) {
        pdf.addPage(pdfWidth, pdfHeight);
        pdf.addImage(
          imgData,
          'JPG',
          topLeftMargin,
          -(pdfHeight * i) + topLeftMargin * 0,
          canvasImageWidth,
          canvasImageHeight
        );
      }
      pdf.save('sort-invoice.pdf');
    });
  });
})(jQuery); // End of use strict
