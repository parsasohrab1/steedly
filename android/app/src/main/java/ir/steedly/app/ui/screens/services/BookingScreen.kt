@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.services

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.model.BookingRequest
import ir.steedly.app.data.model.ServiceProvider
import ir.steedly.app.data.model.ServiceType
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.ui.components.*
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.utils.formatJalaliDate
import ir.steedly.app.utils.toApiDateTime
import kotlinx.coroutines.launch
import java.util.Calendar
import java.util.Date
import java.util.TimeZone

private val TIME_SLOTS = listOf("08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00")

@Composable
fun BookingScreen(navController: NavController, serviceType: String, providerId: Int) {
    val scope = rememberCoroutineScope()
    var provider by remember { mutableStateOf<ServiceProvider?>(null) }
    var loading by remember { mutableStateOf(true) }
    var loadError by remember { mutableStateOf<String?>(null) }
    var submitting by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var success by remember { mutableStateOf(false) }

    // DatePicker works in UTC midnight millis
    var selectedDateUtc by remember { mutableStateOf<Long?>(null) }
    var selectedTime by remember { mutableStateOf<String?>(null) }
    var description by remember { mutableStateOf("") }
    var showDatePicker by remember { mutableStateOf(false) }

    val todayUtc = remember {
        Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply {
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }.timeInMillis
    }
    val datePickerState = rememberDatePickerState()

    LaunchedEffect(serviceType, providerId) {
        loadProvider(serviceType, providerId)
            .onSuccess { provider = it }
            .onFailure { loadError = it.message }
        loading = false
    }

    /** Combines the picked calendar day with the chosen time slot in local time. */
    fun bookingDate(): Date? {
        val dayUtc = selectedDateUtc ?: return null
        val time = selectedTime ?: return null
        val utc = Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply { timeInMillis = dayUtc }
        val (hour, minute) = time.split(":").map { it.toInt() }
        return Calendar.getInstance().apply {
            clear()
            set(utc.get(Calendar.YEAR), utc.get(Calendar.MONTH), utc.get(Calendar.DAY_OF_MONTH), hour, minute)
        }.time
    }

    Scaffold(topBar = { AppTopBar("رزرو خدمات", onBack = { navController.popBackStack() }) }) { padding ->
        val current = provider
        when {
            loading -> LoadingView(Modifier.padding(padding))
            loadError != null -> ErrorView(loadError!!, Modifier.padding(padding))
            success -> EmptyView(
                title = "رزرو شما با موفقیت ثبت شد",
                subtitle = "پس از تأیید ${ServiceType.label(serviceType)} به شما اطلاع داده می‌شود",
                icon = Icons.Default.CheckCircle,
                modifier = Modifier.padding(padding),
                actionLabel = "مشاهده رزروهای من",
                onAction = {
                    navController.navigate(Routes.BOOKINGS) { popUpTo(Routes.SERVICES) }
                }
            )
            current != null -> RequireLogin(navController, Modifier.padding(padding)) {
                Column(
                    modifier = Modifier
                        .padding(padding)
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Card(Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(16.dp)) {
                            Text(current.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                            current.subtitle?.let { Text(it, style = MaterialTheme.typography.bodyMedium) }
                            current.region?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
                        }
                    }

                    Text("تاریخ", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    OutlinedButton(onClick = { showDatePicker = true }, modifier = Modifier.fillMaxWidth()) {
                        Icon(Icons.Default.CalendarToday, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text(bookingDate()?.let { formatJalaliDate(it) }
                            ?: selectedDateUtc?.let { "روز انتخاب شد — ساعت را انتخاب کنید" }
                            ?: "انتخاب تاریخ")
                    }

                    Text("ساعت", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(TIME_SLOTS) { slot ->
                            FilterChip(
                                selected = selectedTime == slot,
                                onClick = { selectedTime = slot },
                                label = { Text(slot) }
                            )
                        }
                    }

                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("توضیحات (اختیاری)") },
                        placeholder = {
                            Text(
                                if (serviceType == ServiceType.VETERINARIAN) "علائم، سن و نژاد اسب..."
                                else "مبدأ، مقصد و تعداد اسب..."
                            )
                        },
                        minLines = 3,
                        maxLines = 6
                    )

                    error?.let { ErrorBanner(it) }

                    Button(
                        onClick = {
                            val date = bookingDate()
                            if (date == null) {
                                error = "لطفاً تاریخ و ساعت را انتخاب کنید"
                                return@Button
                            }
                            if (date.before(Date())) {
                                error = "زمان انتخاب‌شده گذشته است"
                                return@Button
                            }
                            scope.launch {
                                submitting = true
                                error = null
                                apiCall {
                                    RetrofitClient.apiService.createBooking(
                                        BookingRequest(
                                            service_type = serviceType,
                                            service_provider_id = providerId,
                                            booking_date = toApiDateTime(date),
                                            description = description.trim().ifBlank { null }
                                        )
                                    )
                                }.onSuccess { success = true }.onFailure { error = it.message }
                                submitting = false
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        enabled = !submitting && selectedDateUtc != null && selectedTime != null
                    ) {
                        if (submitting) {
                            CircularProgressIndicator(Modifier.size(20.dp), color = MaterialTheme.colorScheme.onPrimary)
                        } else {
                            Text("ثبت رزرو")
                        }
                    }
                }
            }
        }
    }

    if (showDatePicker) {
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    selectedDateUtc = datePickerState.selectedDateMillis
                    showDatePicker = false
                }) { Text("تأیید") }
            },
            dismissButton = { TextButton(onClick = { showDatePicker = false }) { Text("انصراف") } }
        ) {
            // Material3 1.1 API: past days are disabled through dateValidator
            DatePicker(state = datePickerState, dateValidator = { it >= todayUtc })
        }
    }
}
