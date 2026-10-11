
"use strict";

class ImageSlider {
    constructor(sliderElement) {
        this.slider = sliderElement;
        this.track = this.slider.querySelector("#slider-track");
        this.previousButton = this.slider.querySelector("#previous-button");
        this.nextButton = this.slider.querySelector("#next-button");
        this.dotsContainer = this.slider.querySelector("#slider-dots");
        this.counter = this.slider.querySelector("#slide-counter");

        this.originalSlides = Array.from(this.track.children);
        this.slideCount = this.originalSlides.length;

        this.currentIndex = 0;
        this.isTransitioning = false;

        if (this.slideCount === 0) {
            return;
        }

        this.setupClones();
        this.createDots();
        this.updateInterface();
        this.bindEvents();
    }

    setupClones() {
        if (this.slideCount < 2) {
            this.track.style.transition = "none";
            this.previousButton.disabled = true;
            this.nextButton.disabled = true;
            return;
        }

        // Clone the last and first slides for seamless looping.
        const firstClone = this.originalSlides[0].cloneNode(true);
        const lastClone =
            this.originalSlides[this.slideCount - 1].cloneNode(true);

        firstClone.setAttribute("aria-hidden", "true");
        lastClone.setAttribute("aria-hidden", "true");

        this.track.insertBefore(lastClone, this.originalSlides[0]);
        this.track.appendChild(firstClone);

        // Begin at the first original slide.
        this.track.style.transition = "none";
        this.track.style.transform = "translateX(-100%)";
        void this.track.offsetWidth;
        this.track.style.transition = "";
    }

    createDots() {
        this.dotsContainer.replaceChildren();

        this.dots = this.originalSlides.map((slide, index) => {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.className = "slider-dot";
            dot.setAttribute("aria-label", `Go to image ${index + 1}`);

            dot.addEventListener("click", () => {
                this.goToSlide(index);
            });

            this.dotsContainer.appendChild(dot);
            return dot;
        });
    }

    bindEvents() {
        this.nextButton.addEventListener("click", () => {
            this.next();
        });

        this.previousButton.addEventListener("click", () => {
            this.previous();
        });

        this.track.addEventListener("transitionend", (event) => {
            if (
                event.target !== this.track ||
                event.propertyName !== "transform"
            ) {
                return;
            }

            this.finishTransition();
        });

        // Adjust the track when the slider changes size.
        this.resizeObserver = new ResizeObserver(() => {
            this.track.style.transition = "none";
            this.positionTrack();
            void this.track.offsetWidth;
            this.track.style.transition = "";
        });

        this.resizeObserver.observe(this.slider);
    }

    next() {
        if (this.isTransitioning || this.slideCount < 2) {
            return;
        }

        this.currentIndex =
            (this.currentIndex + 1) % this.slideCount;

        this.moveTrack(this.currentIndex + 1);
        this.updateInterface();
    }

    previous() {
        if (this.isTransitioning || this.slideCount < 2) {
            return;
        }

        this.currentIndex =
            (this.currentIndex - 1 + this.slideCount) %
            this.slideCount;

        this.moveTrack(this.currentIndex + 1);
        this.updateInterface();
    }

    goToSlide(index) {
        if (
            this.isTransitioning ||
            index < 0 ||
            index >= this.slideCount ||
            index === this.currentIndex
        ) {
            return;
        }

        this.currentIndex = index;
        this.moveTrack(this.currentIndex + 1);
        this.updateInterface();
    }

    moveTrack(trackIndex) {
        this.isTransitioning = true;

        this.track.style.transform =
            `translateX(-${trackIndex * 100}%)`;
    }

    finishTransition() {
        if (!this.isTransitioning) {
            return;
        }

        this.isTransitioning = false;

        // Reset instantly after reaching a cloned boundary slide.
        if (this.currentIndex === 0) {
            this.resetTrackPosition(-100);
        } else if (this.currentIndex === this.slideCount - 1) {
            this.resetTrackPosition(this.slideCount * -100);
        }
    }

    resetTrackPosition(translatePercent) {
        this.track.style.transition = "none";
        this.track.style.transform =
            `translateX(${translatePercent}%)`;

        void this.track.offsetWidth;
        this.track.style.transition = "";
    }

    positionTrack() {
        this.track.style.transform =
            `translateX(-${(this.currentIndex + 1) * 100}%)`;
    }

    updateInterface() {
        this.dots.forEach((dot, index) => {
            const isActive = index === this.currentIndex;

            dot.classList.toggle("active", isActive);

            if (isActive) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });

        this.counter.textContent =
            `${this.currentIndex + 1} / ${this.slideCount}`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const sliderElement = document.querySelector("#image-slider");

    if (sliderElement) {
        new ImageSlider(sliderElement);
    }
});
