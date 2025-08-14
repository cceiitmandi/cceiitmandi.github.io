// ====== CONFIGURE THESE ======
    const STORED_HEX_HASH = "d010d752ea27e676c6d730800326f575d19a1e47542a59d6d5b8e17a162cd8f4";
    const SALT = "cce-wall";
    const REDIRECT_URL = "inside.html";

    // ====== HASH HELPERS ======
    // ArrayBuffer -> hex string
    function toHex(buf) {
      return [...new Uint8Array(buf)]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
    }
    async function sha256Hex(str) {
      const data = new TextEncoder().encode(str);
      const hash = await crypto.subtle.digest("SHA-256", data);
      return toHex(hash);
    }
    // constant-time-ish compare for equal-length strings
    function safeEqualHex(a, b) {
      if (a.length !== b.length) return false;
      let same = 0;
      for (let i = 0; i < a.length; i++) same |= (a.charCodeAt(i) ^ b.charCodeAt(i));
      return same === 0;
    }

    // ====== UI BEHAVIOR ======
    document.getElementById("showpw").addEventListener("change", (e) => {
      document.getElementById("password").type = e.target.checked ? "text" : "password";
    });

    document.getElementById("passwordForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const err = document.getElementById("err");
      err.textContent = "";

      const pw = document.getElementById("password").value.trim();
      if (!pw) {
        err.textContent = "Please enter the password.";
        return;
      }

      try {
        // Compute hex = SHA256(password + ":" + SALT)
        const userHex = await sha256Hex(pw + ":" + SALT);

        if (!safeEqualHex(userHex, STORED_HEX_HASH)) {
          err.textContent = "Incorrect password. Try again.";
          return;
        }

        // Mark this tab/session as authorized (ephemeral)
        sessionStorage.setItem("cce_gate_ok", "1");
        sessionStorage.setItem("cce_gate_time", String(Date.now()));

        // Redirect to the inside page
        window.location.href = REDIRECT_URL;
      } catch (ex) {
        console.error(ex);
        err.textContent = "Unexpected error. Please try again.";
      }
    });