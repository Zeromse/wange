const stageModes = {
  main: {
    nodes: ['EA-1', 'EA-2', 'EA-3', 'EA-4', 'EA-5', 'EA-6', 'EA-7', 'EA-8'],
    image: 'assets/stage-route.webp',
    alt: '摇曳的影关卡地图录屏画面',
    caption: '摇曳的影 · 关卡地图',
    time: 'SCREEN CAPTURE / 00:56',
    note: '常规关卡路径；地图截图来自提供的活动录屏。'
  },
  ex: {
    nodes: ['EA-EX-1'],
    image: 'assets/stage-ex.webp',
    alt: '将熄的火 EA-EX-1 关卡地图录屏画面',
    caption: '将熄的火 · 延伸关卡',
    time: 'SCREEN CAPTURE / 01:20',
    note: '录屏中展示的 EA-EX-1 关卡节点。'
  }
};

const stageTabs = [...document.querySelectorAll('[data-stage-mode]')];
const stageNodes = document.getElementById('stage-nodes');
const stagePanel = document.getElementById('stage-panel');
let selectedStageMode = 'main';
let selectedStage = 'EA-1';

function renderStages(mode) {
  selectedStageMode = mode;
  const data = stageModes[mode];
  selectedStage = data.nodes[0];
  stageTabs.forEach(tab => {
    const active = tab.dataset.stageMode === mode;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active) stagePanel.setAttribute('aria-labelledby', tab.id);
  });
  stageNodes.replaceChildren();
  data.nodes.forEach((name, index) => {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = index === 0 ? 'active' : '';
    node.setAttribute('aria-pressed', String(index === 0));
    node.innerHTML = `<small>OPERATION</small><strong>${name}</strong>`;
    node.addEventListener('click', () => {
      selectedStage = name;
      [...stageNodes.children].forEach(button => {
        const active = button === node;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      document.getElementById('selected-stage').textContent = selectedStage;
    });
    stageNodes.append(node);
  });
  document.getElementById('stage-count').textContent = `${String(data.nodes.length).padStart(2, '0')} / ${String(data.nodes.length).padStart(2, '0')}`;
  document.getElementById('selected-stage').textContent = selectedStage;
  document.getElementById('stage-note').textContent = data.note;
  const image = document.getElementById('stage-image');
  image.src = data.image;
  image.alt = data.alt;
  document.getElementById('stage-caption').textContent = data.caption;
  document.querySelector('.stage-image figcaption span:last-child').textContent = data.time;
}

stageTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => renderStages(tab.dataset.stageMode));
  tab.addEventListener('keydown', event => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % stageTabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + stageTabs.length) % stageTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = stageTabs.length - 1;
    if (next !== index) {
      event.preventDefault();
      stageTabs[next].focus();
      renderStages(stageTabs[next].dataset.stageMode);
    }
  });
});
renderStages('main');

const budget = 1772;
const rewards = [
  { name: '水灯心的信物', price: 280 },
  { name: '寻访凭证', price: 150 },
  { name: '聚合剂', price: 100 },
  { name: '手工墙架', price: 65 },
  { name: '复古收纳柜', price: 55 },
  { name: '环烃预制体', price: 45 },
  { name: '手性屈光体', price: 35 },
  { name: '晶体电路', price: 40, soldOut: true }
];
const selectedRewards = new Set();
const rewardGrid = document.getElementById('reward-grid');

function updateRewardTotals() {
  const total = rewards.reduce((sum, item) => sum + (selectedRewards.has(item.name) ? item.price : 0), 0);
  document.getElementById('selected-cost').innerHTML = `${total.toLocaleString('en-US')} <small>POINTS</small>`;
  document.getElementById('remaining-points').textContent = (budget - total).toLocaleString('en-US');
}

rewards.forEach(item => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'reward-item';
  button.disabled = !!item.soldOut;
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', `${item.name}，${item.soldOut ? '已售罄' : `${item.price} 点，加入兑换试算`}`);
  const check = document.createElement('span');
  check.className = 'reward-select';
  check.setAttribute('aria-hidden', 'true');
  const content = document.createElement('span');
  content.className = 'reward-text';
  const name = document.createElement('strong');
  name.textContent = item.name;
  const status = document.createElement('small');
  status.textContent = item.soldOut ? '录屏中已售罄' : '点击加入试算';
  content.append(name, status);
  const price = document.createElement('span');
  price.className = 'reward-price';
  price.textContent = item.soldOut ? '售罄' : String(item.price);
  button.append(check, content, price);
  if (!item.soldOut) button.addEventListener('click', () => {
    const selected = !selectedRewards.has(item.name);
    if (selected) selectedRewards.add(item.name);
    else selectedRewards.delete(item.name);
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${item.name}，${item.price} 点，${selected ? '从兑换试算移除' : '加入兑换试算'}`);
    check.textContent = selected ? '✓' : '';
    status.textContent = selected ? '已加入试算' : '点击加入试算';
    updateRewardTotals();
  });
  rewardGrid.append(button);
});
document.getElementById('reset-rewards').addEventListener('click', () => {
  selectedRewards.clear();
  [...rewardGrid.querySelectorAll('.reward-item')].forEach((button, index) => {
    button.classList.remove('selected');
    button.setAttribute('aria-pressed', 'false');
    if (!rewards[index].soldOut) {
      button.querySelector('.reward-select').textContent = '';
      button.querySelector('.reward-text small').textContent = '点击加入试算';
      button.setAttribute('aria-label', `${rewards[index].name}，${rewards[index].price} 点，加入兑换试算`);
    }
  });
  updateRewardTotals();
});
updateRewardTotals();

const archiveSlides = [
  { image: 'assets/story-home.webp', alt: '新火重燃剧情回顾插画', type: 'STORY LINE · TA', name: '新火重燃', description: '录屏中的剧情回顾画面。插画以明亮色彩与人物群像构成，与活动主界面的灰烬和火焰形成呼应。' },
  { image: 'assets/story-fire.webp', alt: '照我以火剧情回顾插画', type: 'STORY LINE · TA', name: '照我以火', description: '录屏中切换到的另一组剧情回顾画面，人物与篝火成为画面的中心。' },
  { image: 'assets/memory.webp', alt: '挽歌燃烧殆尽回忆画集插画', type: 'MEMORIAL GALLERY', name: '回忆画集', description: '「挽歌燃烧殆尽」的画集画面，呈现录屏里被收藏的活动插画。' }
];
let archiveIndex = 0;
const archiveDots = document.getElementById('archive-dots');

function showArchive(index) {
  archiveIndex = (index + archiveSlides.length) % archiveSlides.length;
  const slide = archiveSlides[archiveIndex];
  const image = document.getElementById('archive-image');
  image.src = slide.image;
  image.alt = slide.alt;
  document.getElementById('archive-type').textContent = slide.type;
  document.getElementById('archive-name').textContent = slide.name;
  document.getElementById('archive-description').textContent = slide.description;
  document.getElementById('archive-counter').textContent = `${String(archiveIndex + 1).padStart(2, '0')} / 03`;
  [...archiveDots.children].forEach((dot, i) => {
    dot.classList.toggle('active', i === archiveIndex);
    dot.setAttribute('aria-current', i === archiveIndex ? 'true' : 'false');
  });
}
archiveSlides.forEach((slide, i) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.setAttribute('aria-label', `查看${slide.name}`);
  dot.addEventListener('click', () => showArchive(i));
  archiveDots.append(dot);
});
document.getElementById('archive-prev').addEventListener('click', () => showArchive(archiveIndex - 1));
document.getElementById('archive-next').addEventListener('click', () => showArchive(archiveIndex + 1));
document.querySelector('.archive-layout').addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); showArchive(archiveIndex - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showArchive(archiveIndex + 1); }
});
showArchive(0);

const videoDialog = document.getElementById('video-dialog');
const sourceVideo = document.getElementById('source-video');
document.querySelectorAll('.open-video').forEach(button => button.addEventListener('click', () => {
  document.getElementById('mobile-nav').hidden = true;
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
  videoDialog.showModal();
}));
document.getElementById('close-video').addEventListener('click', () => videoDialog.close());
videoDialog.addEventListener('close', () => sourceVideo.pause());
videoDialog.addEventListener('click', event => {
  if (event.target === videoDialog) videoDialog.close();
});

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
menuToggle.addEventListener('click', () => {
  mobileNav.hidden = !mobileNav.hidden;
  menuToggle.setAttribute('aria-expanded', String(!mobileNav.hidden));
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
}));
