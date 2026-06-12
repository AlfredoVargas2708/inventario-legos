<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import Message from "primevue/message";
import {
  updatePedido,
  type PedidoRow,
  type PedidoUpdatePayload,
} from "@/api/api.service";
import { useDataSharingService } from "@/api/data-sharing.service";

const props = defineProps<{
  visible: boolean;
  pedido: PedidoRow | null;
}>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const dataService = useDataSharingService();

const submitting = ref(false);
const errorMessage = ref("");

const siNoOptions = [
  { label: "Sí", value: "Si" },
  { label: "No", value: "No" },
];

const form = reactive({
  lego: "",
  pieza: "",
  cantidad: 1,
  task: "",
  esta_pedido: "No",
  esta_completo: "No",
  esta_reemplazado: "",
  comentarios: "",
});

function loadForm() {
  errorMessage.value = "";
  if (!props.pedido) return;

  form.lego = props.pedido.lego ?? "";
  form.pieza = props.pedido.pieza ?? "";
  form.cantidad = Number(props.pedido.cantidad) || 1;
  form.task = props.pedido.task ?? "";
  form.esta_pedido = props.pedido.esta_pedido ?? "No";
  form.esta_completo = props.pedido.esta_completo ?? "No";
  form.esta_reemplazado = props.pedido.esta_reemplazado ?? "";
  form.comentarios = props.pedido.comentarios ?? "";
}

watch(
  () => [props.visible, props.pedido] as const,
  ([visible]) => {
    if (visible) loadForm();
  },
  { immediate: true },
);

function buildPayload(): PedidoUpdatePayload {
  return {
    lego: form.lego.trim(),
    pieza: form.pieza.trim(),
    cantidad: String(form.cantidad),
    task: form.task.trim(),
    esta_pedido: form.esta_pedido,
    esta_completo: form.esta_completo,
    esta_reemplazado: form.esta_reemplazado.trim() || null,
    comentarios: form.comentarios.trim() || null,
  };
}

async function submit() {
  errorMessage.value = "";

  if (!props.pedido?.id) {
    errorMessage.value = "No se encontró el pedido a editar.";
    return;
  }

  if (!form.lego.trim() || !form.pieza.trim() || !form.task.trim()) {
    errorMessage.value = "Lego, pieza y número de bolsa son obligatorios.";
    return;
  }

  submitting.value = true;
  try {
    await updatePedido(props.pedido.id, buildPayload());
    await dataService.refreshResults();
    emit("success");
  } catch {
    errorMessage.value = "No se pudo actualizar el pedido. Intenta de nuevo.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="pedido-form" @submit.prevent="submit">
    <Message v-if="errorMessage" severity="error" :closable="false" class="form-message">
      {{ errorMessage }}
    </Message>

    <div class="form-grid">
      <div class="field">
        <label for="editar-lego">Lego</label>
        <InputText id="editar-lego" v-model="form.lego" class="w-full" required />
      </div>

      <div class="field">
        <label for="editar-pieza">Pieza</label>
        <InputText id="editar-pieza" v-model="form.pieza" class="w-full" required />
      </div>

      <div class="field">
        <label for="editar-cantidad">Cantidad</label>
        <InputNumber
          id="editar-cantidad"
          v-model="form.cantidad"
          :min="1"
          :max="999"
          show-buttons
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="editar-task">N° Bolsa</label>
        <InputText id="editar-task" v-model="form.task" class="w-full" required />
      </div>

      <div class="field">
        <label for="editar-pedido">¿Pedido?</label>
        <Select
          id="editar-pedido"
          v-model="form.esta_pedido"
          :options="siNoOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="editar-completo">¿Completo?</label>
        <Select
          id="editar-completo"
          v-model="form.esta_completo"
          :options="siNoOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="editar-reemplazado">Reemplazado</label>
        <InputText
          id="editar-reemplazado"
          v-model="form.esta_reemplazado"
          placeholder="Opcional"
          class="w-full"
        />
      </div>

      <div class="field field--full">
        <label for="editar-comentarios">Comentarios</label>
        <Textarea
          id="editar-comentarios"
          v-model="form.comentarios"
          rows="3"
          placeholder="Opcional"
          class="w-full"
          auto-resize
        />
      </div>
    </div>

    <div class="form-actions">
      <Button
        type="button"
        label="Cancelar"
        severity="secondary"
        outlined
        :disabled="submitting"
        @click="emit('close')"
      />
      <Button
        type="submit"
        label="Guardar cambios"
        icon="pi pi-check"
        :loading="submitting"
      />
    </div>
  </form>
</template>

<style scoped>
.pedido-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-message {
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field--full {
  grid-column: 1 / -1;
}

.field label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--app-text-muted);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--p-content-border-color, #e2e8f0);
}

@media (max-width: 575px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
