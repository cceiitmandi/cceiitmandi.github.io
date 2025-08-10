<script>
  const menuToggle = document.getElementById('menuToggle');
  const menu = document.getElementById('menu');

  menuToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    menu.classList.toggle('active');
  });

  document.addEventListener('click', function (e) {
    if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
      menu.classList.remove('active');
    }});
</script>
