<script setup lang="ts">
import { storeToRefs } from "pinia";
import { reactive, ref, watch } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import Message from "primevue/message";
import { createPedido, type PedidoPayload } from "@/api/api.service";
import { useDataSharingService } from "@/api/data-sharing.service";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const dataService = useDataSharingService();
const { column, searchValue, valueInfo } = storeToRefs(dataService);

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
  set_nombre: "",
});

function resetForm() {
  errorMessage.value = "";
  form.lego = column.value === "lego" ? searchValue.value : "";
  form.pieza = column.value === "pieza" ? (valueInfo.value?.element_id ?? searchValue.value) : "";
  form.cantidad = 1;
  form.task = "";
  form.esta_pedido = "No";
  form.esta_completo = "No";
  form.esta_reemplazado = "";
  form.comentarios = "";
  form.set_nombre = column.value === "lego" ? (valueInfo.value?.theme?.at(-1)?.name ?? "") : "";
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) resetForm();
  },
  { immediate: true },
);

function buildPayload(): PedidoPayload {
  return {
    lego: form.lego.trim(),
    pieza: form.pieza.trim(),
    cantidad: String(form.cantidad),
    task: form.task.trim(),
    esta_pedido: form.esta_pedido,
    esta_completo: form.esta_completo,
    esta_reemplazado: form.esta_reemplazado.trim() || null,
    comentarios: form.comentarios.trim() || null,
    set_nombre: form.set_nombre.trim() || undefined,
  };
}

async function submit() {
  errorMessage.value = "";

  if (!form.lego.trim() || !form.pieza.trim() || !form.task.trim()) {
    errorMessage.value = "Lego, pieza y número de bolsa son obligatorios.";
    return;
  }

  submitting.value = true;
  try {
    await createPedido(buildPayload());
    await dataService.refreshResults();
    emit("success");
  } catch {
    errorMessage.value = "No se pudo crear el pedido. Intenta de nuevo.";
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
        <label for="pedido-lego">Lego</label>
        <InputText
          id="pedido-lego"
          v-model="form.lego"
          placeholder="Lego"
          class="w-full"
          :disabled="column === 'lego'"
          required
        />
      </div>

      <div class="field">
        <label for="pedido-pieza">Pieza</label>
        <InputText
          id="pedido-pieza"
          v-model="form.pieza"
          placeholder="Pieza"
          class="w-full"
          :disabled="column === 'pieza'"
          required
        />
      </div>

      <div class="field">
        <label for="pedido-cantidad">Cantidad</label>
        <InputNumber
          id="pedido-cantidad"
          v-model="form.cantidad"
          :min="1"
          :max="999"
          show-buttons
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="pedido-task">N° Bolsa</label>
        <InputText
          id="pedido-task"
          v-model="form.task"
          placeholder="Bolsa"
          class="w-full"
          required
        />
      </div>

      <div class="field">
        <label for="pedido-set">Set / Tema</label>
        <InputText
          id="pedido-set"
          v-model="form.set_nombre"
          placeholder="Set Nombre"
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="pedido-pedido">¿Pedido?</label>
        <Select
          id="pedido-pedido"
          v-model="form.esta_pedido"
          :options="siNoOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="pedido-completo">¿Completo?</label>
        <Select
          id="pedido-completo"
          v-model="form.esta_completo"
          :options="siNoOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="pedido-reemplazado">Reemplazado</label>
        <InputText
          id="pedido-reemplazado"
          v-model="form.esta_reemplazado"
          placeholder="Opcional"
          class="w-full"
        />
      </div>

      <div class="field field--full">
        <label for="pedido-comentarios">Comentarios</label>
        <Textarea
          id="pedido-comentarios"
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
      <Button type="submit" label="Guardar pedido" icon="pi pi-check" :loading="submitting" />
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
  color: var(--p-text-muted-color, #64748b);
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
