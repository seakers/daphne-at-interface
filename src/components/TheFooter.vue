<template>
    <footer class="is-main-footer">
        <div class="container">
            <div class="has-text-centered">
                <p><strong>Daphne</strong> by <a href="https://www.selva-research.com">SEAK Lab</a>. The source code is licensed
                    <a href="http://opensource.org/licenses/mit-license.php">MIT</a>.</p>
              <div>{{ timestamp }}</div>
            </div>
        </div>
    </footer>
</template>

<script type = "text/javascript">
    export default {
      name: "TheFooter",
      data() {
        return {
          timestamp: ""
        }
      },
      created() {
        setInterval(this.getNow, 1000);
      },
      methods: {
        getNow: function() {
          const today = new Date();
          const date = today.toDateString();
          const time = today.toLocaleTimeString();
          this.timestamp = date + ' ' + time;
        }
      }
    }

</script>

<style scoped>

</style>