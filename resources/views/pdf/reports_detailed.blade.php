<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>{{ $title }}</title>

<style>
*{font-family: DejaVu Sans,sans-serif;}
body{font-size:13px;color:#111827;}
.container{max-width:900px;margin:auto;}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
.logo{max-height:60px;}
.title{font-size:22px;font-weight:bold;}
.subtitle{font-size:11px;color:#6b7280;}
.card{border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin-bottom:16px;page-break-inside: avoid;}
.card-title{font-size:15px;font-weight:bold;margin-bottom:8px;}
.info-grid td{padding:4px 0;vertical-align:top;}
.summary{width:100%;margin-top:10px;}
.summary td{width:25%;padding:6px;}
.summary-box{border:1px solid #e5e7eb;border-radius:10px;padding:10px;text-align:center;}
.summary-label{font-size:11px;color:#6b7280;}
.summary-value{font-size:18px;font-weight:bold;}
.table{width:100%;border-collapse:collapse;margin-top:10px;}
.table th,.table td{border:1px solid #e5e7eb;padding:7px;vertical-align:top;}
.table th{background:#f3f4f6;font-weight:bold;text-align:left;}
.gps{font-size:11px;color:#6b7280;}
.total-box{border:2px solid #111827;padding:14px;border-radius:12px;font-weight:bold;font-size:14px;}
.page-break{page-break-before:always;}
.empty{color:#6b7280;font-size:12px;}
.money-nowrap{white-space:nowrap;}
</style>
</head>

<body>
<div class="container">
<div class="header">
  <div>
    <div class="title">{{ $title }}</div>
    <div class="subtitle">Gerado em {{ $generatedAt }}</div>
  </div>

  @if(!empty($companyLogoPath))
    <img src="{{ $companyLogoPath }}" class="logo">
  @endif
</div>

<div class="card">
  <div class="card-title">Filtros</div>

  @php
    $has=false;
    foreach(($filters ?? []) as $v){
      if($v!==null && $v!==''){
        $has=true;
        break;
      }
    }
  @endphp

  @if(!$has)
    <div class="empty">Nenhum filtro aplicado</div>
  @else
    <table class="table">
      <tbody>
        @foreach(($filters ?? []) as $k=>$v)
          @if($v!==null && $v!=='')
            <tr>
              <th style="width:200px">{{ $k }}</th>
              <td>{{ $v }}</td>
            </tr>
          @endif
        @endforeach
      </tbody>
    </table>
  @endif
</div>

@php
$grandEntries=0;
$grandExpenses=0;
$grandBilling=0;
@endphp

@forelse($trips as $index=>$trip)
  @php
    $activeEntries=(float)$trip->entries->where('is_active',true)->sum('amount');
    $activeExpenses=(float)$trip->expenses->where('is_active',true)->sum('amount');
    $balance=$activeEntries-$activeExpenses;
    $billingAmount=(float)($trip->billing_material_amount ?? 0);

    $grandEntries+=$activeEntries;
    $grandExpenses+=$activeExpenses;
    $grandBilling+=$billingAmount;

    $vehicle='-';
    if($trip->vehicle){
      $base=trim(($trip->vehicle->brand ?? '').' '.($trip->vehicle->model ?? ''));
      $vehicle = trim($base) !== '' ? ($base.' - '.($trip->vehicle->plate ?? '')) : ($trip->vehicle->plate ?? '-');
    }

    $employee=$trip->employeeProfile?->full_name ?? '-';
  @endphp

  <div class="card {{ $index>0?'page-break':'' }}">
    <div class="card-title">
      Viagem #{{ $trip->id }} — {{ $trip->trip_name ?: 'Sem descrição' }}
    </div>

    <table class="info-grid">
      <tr>
        <td><b>Rota:</b> {{ $trip->city_origin }} → {{ $trip->city_destination }}</td>
        <td><b>Funcionário:</b> {{ $employee }}</td>
      </tr>
      <tr>
        <td>
          <b>Datas:</b>
          {{ optional($trip->start_date)->format('d/m/Y') ?? '-' }}
          →
          {{ optional($trip->end_date)->format('d/m/Y') ?? '-' }}
        </td>
        <td><b>Veículo:</b> {{ $vehicle }}</td>
      </tr>
      <tr>
        <td><b>Trajeto:</b> {{ $trip->route_description ?: '-' }}</td>
        <td><b>Total KM:</b> {{ $trip->total_km ?? '-' }}</td>
      </tr>
      <tr>
        <td><b>Material p/ faturar:</b> {{ $trip->billing_material_description ?: '-' }}</td>
        <td>
          <b>Valor p/ faturar depois:</b>
          <span class="money-nowrap">R$&nbsp;{{ number_format($billingAmount,2,',','.') }}</span>
        </td>
      </tr>
    </table>

    <table class="summary">
      <tr>
        <td>
          <div class="summary-box">
            <div class="summary-label">Entradas</div>
            <div class="summary-value money-nowrap">R$&nbsp;{{ number_format($activeEntries,2,',','.') }}</div>
          </div>
        </td>
        <td>
          <div class="summary-box">
            <div class="summary-label">Despesas</div>
            <div class="summary-value money-nowrap">R$&nbsp;{{ number_format($activeExpenses,2,',','.') }}</div>
          </div>
        </td>
        <td>
          <div class="summary-box">
            <div class="summary-label">Saldo</div>
            <div class="summary-value money-nowrap">R$&nbsp;{{ number_format($balance,2,',','.') }}</div>
          </div>
        </td>
        <td>
          <div class="summary-box">
            <div class="summary-label">Faturar depois</div>
            <div class="summary-value money-nowrap">R$&nbsp;{{ number_format($billingAmount,2,',','.') }}</div>
          </div>
        </td>
      </tr>
    </table>
  </div>

  <div class="card">
    <div class="card-title">Despesas</div>

    @if($trip->expenses->count())
      <table class="table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Empresa</th>
            <th>Data</th>
            <th>Cidade</th>
            <th>Valor</th>
            <th>GPS</th>
          </tr>
        </thead>
        <tbody>
          @foreach($trip->expenses as $x)
            <tr>
              <td>{{ $x->type }}</td>
              <td>{{ $x->company_name ?: '-' }}</td>
              <td>{{ optional($x->expense_date)->format('d/m/Y') ?? '-' }}</td>
              <td>{{ $x->city_name ?: '-' }}</td>
              <td style="white-space:nowrap;">
                <span class="money-nowrap">R$&nbsp;{{ number_format((float)$x->amount,2,',','.') }}</span>
              </td>
              <td class="gps">
                @if($x->latitude && $x->longitude)
                  {{ $x->latitude }}, {{ $x->longitude }}<br>
                  <a href="https://www.google.com/maps?q={{ $x->latitude }},{{ $x->longitude }}">Abrir mapa</a>
                @else
                  -
                @endif
              </td>
            </tr>
          @endforeach
        </tbody>
      </table>
    @else
      <div class="empty">Nenhuma despesa.</div>
    @endif
  </div>
@empty
  <div class="card">
    <div class="empty">Nenhuma viagem encontrada</div>
  </div>
@endforelse

@php
$balance=$grandEntries-$grandExpenses;
@endphp

<div class="total-box">
  TOTAL DO RELATÓRIO
  <br><br>
  Entradas totais: <span class="money-nowrap">R$&nbsp;{{ number_format($grandEntries,2,',','.') }}</span>
  <br>
  Despesas totais: <span class="money-nowrap">R$&nbsp;{{ number_format($grandExpenses,2,',','.') }}</span>
  <br>
  Saldo geral: <span class="money-nowrap">R$&nbsp;{{ number_format($balance,2,',','.') }}</span>
  <br>
  Faturamento posterior: <span class="money-nowrap">R$&nbsp;{{ number_format($grandBilling,2,',','.') }}</span>
</div>

</div>
</body>
</html>