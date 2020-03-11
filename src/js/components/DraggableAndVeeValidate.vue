<script>
//extending so we can have the same $validator instance across components 
import draggable from "vuedraggable";
export default {
  extends: draggable,
  inject: {
    $validator: '$validator',
  },
}
</script>
