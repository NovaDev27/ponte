package app.ponte.wearsync

import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Manda para o relógio o que ele mostra: cidade, moeda, endereço de casa, próxima tarefa e orçamento.
// O relógio lê o mesmo caminho ("/ponte") no app Ponte para Wear OS.
class PonteWearModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("PonteWear")

    // Devolve false quando não deu (sem Google Play Services, sem app de relógio etc.); nunca derruba o app.
    AsyncFunction("sync") { data: Map<String, Any?> ->
      val context = appContext.reactContext ?: return@AsyncFunction false
      try {
        val request = PutDataMapRequest.create("/ponte")
        val map = request.dataMap
        for ((key, value) in data) {
          when (value) {
            is String -> map.putString(key, value)
            is Boolean -> map.putBoolean(key, value)
            // Números do JS chegam como Double; datas (chaves terminadas em "At") vão como Long.
            is Number -> if (key.endsWith("At")) map.putLong(key, value.toLong()) else map.putDouble(key, value.toDouble())
          }
        }
        Tasks.await(Wearable.getDataClient(context).putDataItem(request.asPutDataRequest().setUrgent()))
        true
      } catch (_: Exception) {
        false
      }
    }
  }
}
