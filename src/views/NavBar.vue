
<script lang="ts">
import { Options, Vue } from "vue-class-component";
@Options({
  inheritAttrs: false,
})
export default class NavBar extends Vue {}

</script><template>
  <div class="w-full flex justify-start space-x-4 select-none">
    <router-link class="link navbar-link" to="/">home</router-link>
    <router-link class="link navbar-link" to="/projects">projects</router-link>
  </div>
</template>

<style lang="postcss">
.navbar-link {
  @apply text-center text-4xl underline;
}
</style>