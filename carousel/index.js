const IndicatorItem = (data) => {
  return `<li 
  data-slide-to="${data.idx}" 
  class="${data.idx === 0 ? '--active' : ''}"
  style="
  background-image: url('${data.img}')
  "></li>`;
}

const CarouselContainer = function (containerId, slidesData) {
  this.currentSlideIdx = 0;
  this.carousel = document.getElementById(containerId);
  this.mainScreen = this.carousel.querySelector(".main-screen");
  this.indicatorsContainer = this.carousel.querySelector('.indicators-container');

  this.initialize = () => {
    this.indicatorsContainer.innerHTML = slidesData.map((slideData, idx) => IndicatorItem({
      idx: idx,
      ...slideData
    })).join('')
    this.indicatorItems = Array.from(this.carousel.querySelectorAll(".indicators-container li"));
    this.addControlButtonEventListener();
    this.addIndicatorsEventListener();
    this.renderSlide(0);
  }

  this.addControlButtonEventListener = () => {
    const controlButtons = Array.from(this.carousel.getElementsByClassName('carousel-control__btn'));
    controlButtons.forEach((button) => {
      button.onclick = (event) => {
        event.preventDefault();
        this.currentSlideIdx += slidesData.length + (event.currentTarget.classList.contains('--prev') ? -1 : 1);
        this.currentSlideIdx %= slidesData.length;
        this.onIndicatorActive(this.indicatorItems[this.currentSlideIdx], scrollIntoView = true);
      }
    })
  }

  this.onIndicatorActive = (target, scrollIntoView = false) => {
    this.indicatorItems.forEach((otherItem) => {
      otherItem.classList.remove('--active')
    })
    target.classList.add('--active');
    const newIdx = target.getAttribute('data-slide-to') - 0;
    if (scrollIntoView && 0 <= newIdx && newIdx < slidesData.length) {
      this.indicatorsContainer.style.transform =
        `translate(${-target.getBoundingClientRect().width * newIdx}px, 0)`
    }
    this.renderSlide(newIdx);
  }

  this.addIndicatorsEventListener = () => {
    this.indicatorItems.forEach((item) => {
      item.onmouseover = (event) => {
        this.onIndicatorActive(event.target)
      }
      item.ontouchstart = (event) => {
        this.onIndicatorActive(event.target)
      }
      item.onclick = (event) => {
        this.onIndicatorActive(event.target)
      }
    })
  }

  this.renderSlide = (idx) => {
    this.currentSlideIdx = idx % slidesData.length;
    this.renderMainScreen(idx % slidesData.length);
  }

  this.renderMainScreen = (idx) => {
    Object.assign(this.mainScreen.style, {
      backgroundImage: `url("${slidesData[idx].img}")`
    })
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const slidesData = [
    {
      'img': 'http://4.bp.blogspot.com/-xEkomMNdX-E/UAAUklSUMiI/AAAAAAAAAxI/1zthp0wkEM0/s400/langque4.jpg'
    },
    {
      'img': 'http://www.tacphammoi.net/uploads/images/V%C4%83n%20xu%C3%B4i/V%E1%BB%81%20l%E1%BA%A1i%20c%C3%A1nh%20%C4%91%E1%BB%93ng%20x%C6%B0a.jpg'
    },
    {
      'img': 'https://aokieudep.com/wp-content/uploads/2016/05/mau-gat.jpg'
    },
    {
      'img': 'http://www.tacphammoi.net/uploads/images/V%C4%83n%20xu%C3%B4i/V%E1%BB%81%20l%E1%BA%A1i%20c%C3%A1nh%20%C4%91%E1%BB%93ng%20x%C6%B0a.jpg'
    },
    {
      'img': 'https://aokieudep.com/wp-content/uploads/2016/05/mau-gat.jpg'
    },
    {
      'img': 'http://www.tacphammoi.net/uploads/images/V%C4%83n%20xu%C3%B4i/V%E1%BB%81%20l%E1%BA%A1i%20c%C3%A1nh%20%C4%91%E1%BB%93ng%20x%C6%B0a.jpg'
    },
    {
      'img': 'https://aokieudep.com/wp-content/uploads/2016/05/mau-gat.jpg'
    }
  ]
  const carousel = new CarouselContainer('carousel', slidesData);
  carousel.initialize();
})