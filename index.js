// Card templates (should be loaded dynamically for all 20+, demo 1 type for now)
const cardTemplates = {
  'विवाह': 'cards/wedding.svg'
  // Add more as cards/birthday.svg etc.
};

const cardTypeSelect = document.getElementById('cardType');
Object.keys(cardTemplates).forEach((type) => {
  const opt = document.createElement('option');
  opt.value = type;
  opt.innerText = type;
  cardTypeSelect.appendChild(opt);
});

function updatePreview() {
  const type = cardTypeSelect.value;
  const name = document.getElementById('name').value || "";
  const heading = document.getElementById('heading').value || "";
  const date = document.getElementById('date').value || "";
  const time = document.getElementById('time').value || "";
  const venue = document.getElementById('venue').value || "";
  const invitor = document.getElementById('invitor').value || "";
  const coordinator = document.getElementById('coordinator').value || "";
  const color = document.getElementById('color').value || "#800000";
  const border = document.getElementById('border').value || "floral";
  const font = document.getElementById('font').value || "Mukta";
  fetch(cardTemplates[type])
    .then(resp => resp.text())
    .then(svg => {
      svg = svg.replace(/\{\{name\}\}/g, name)
        .replace(/\{\{heading\}\}/g, heading)
        .replace(/\{\{date\}\}/g, date)
        .replace(/\{\{time\}\}/g, time)
        .replace(/\{\{venue\}\}/g, venue)
        .replace(/\{\{invitor\}\}/g, invitor)
        .replace(/\{\{coordinator\}\}/g, coordinator)
        .replace(/\{\{color\}\}/g, color)
        .replace(/\{\{border\}\}/g, border)
        .replace(/\{\{font\}\}/g, font);
      document.getElementById('cardPreview').innerHTML = svg;
    });
}

document.getElementById('cardForm').addEventListener('input', updatePreview);
document.getElementById('previewBtn').addEventListener('click', updatePreview);

document.getElementById('downloadBtn').addEventListener('click', function(){
  let svg = document.getElementById('cardPreview').innerHTML;
  let blob = new Blob([svg], {type: "image/svg+xml"});
  let url = URL.createObjectURL(blob);
  let link = document.createElement('a');
  link.href = url;
  link.download = "invitation_card.svg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});