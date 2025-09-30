async function fetchTestimonials() {
      try {
        const response = await fetch('testimonials.json');
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();
        return data;
      } catch (err) {
        console.warn("Using fallback testimonials due to error:", err);
        // Fallback testimonials
        return [
          {
            text: "Error. Fallback testimonial. JSON file could not be loaded.",
            name: "Fallback User",
            role: "Demo User",
            stars: 4,
            image: "imgs/profile.png"
          }
        ];
      }
    }

    function createTestimonialCard(t) {
      const div = document.createElement('div');
      div.className = 'testimonial';
      div.innerHTML = `
        <div class="stars">${'★'.repeat(t.stars)}${'☆'.repeat(5 - t.stars)}</div>
        <p>"${t.text}"</p>
        <div class="profile">
          <img src="${t.image}" alt="${t.name}">
          <div class="author-info">
            <div class="author">${t.name}</div>
            <div class="role">${t.role}</div>
          </div>
        </div>
      `;
      return div;
    }

    async function renderTestimonials() {
      const data = await fetchTestimonials();
      const track = document.getElementById('testimonial-track');
      const duplicate = document.getElementById('testimonial-track-duplicate');

      data.forEach(t => {
        track.appendChild(createTestimonialCard(t));
        duplicate.appendChild(createTestimonialCard(t));
      });
    }

    renderTestimonials();