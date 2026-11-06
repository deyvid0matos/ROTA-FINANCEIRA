<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>{{ $title }}</title>
<style>
*{ font-family: DejaVu Sans, sans-serif; }
body{ font-size: 12px; color:#111; }
.title{ font-size:18px; font-weight:700; margin-bottom:4px; }
.muted{ color:#666; }
.card{ border:1px solid #e5e7eb; border-radius:10px; padding:12px; margin:12px 0; }
.table{ width:100%; border-collapse:collapse; }
.table th, .table td{ border:1px solid #e5e7eb; padding:6px; vertical-align:top; }
.table th{ background:#f9fafb; text-align:left; }
.right{ text-align:right; }
.small{ font-size:11px; }
.hr{ height:1px; background:#e5e7eb; margin:10px 0; }
.money-nowrap{ white-space: nowrap; }
</style>
</head>
<body>

<div class="title">{{ $title }}</div>
<div class="muted small">Gerado em: {{ $generatedAt }}</div>

<div class="card">
  <div style="font-weight:700;">Filtros</div>
  <div class="hr"></div>
  <div class="small muted">
    @php
      $has = false;
      foreach(($filters ?? []) as $k => $v){
        if($v !== null && $v !== '') { $has = true; break; }
      }
    @endphp

    @if(!$has)
      Nenhum filtro aplicado.
    @else
      @foreach(($filters ?? []) as $k => $v)
        @if($v !== null && $v !== '')
          <div><strong>{{ $k }}:</strong> {{ $v }}</div>
        @endif
      @endforeach
    @endif
  </div>
</div>

@php
  $sumEntries = 0;
  $sumExpenses = 0;
  $sumBalance = 0;
  $sumBilling = 0;
@endphp

<div class="card">
  <div style="font-weight:700;">Resumo por Viagem</div>
  <div class="hr"></div>

  <table class="table">
    <thead>
      <tr>
        <th>#</th>
        <th>Descrição / Rota</th>
        <th>Datas</th>
        <th>Funcionário</th>
        <th>Status</th>
        <th class="right">Entradas</th>
        <th class="right">Despesas</th>
        <th class="right">Saldo</th>
        <th class="right">Faturar depois</th>
      </tr>
    </thead>
    <tbody>
      @forelse($rows as $r)
        @php
          $sumEntries += (float)$r['active_entries'];
          $sumExpenses += (float)$r['active_expenses'];
          $sumBalance += (float)$r['balance'];
          $sumBilling += (float)($r['billing_material_amount'] ?? 0);
        @endphp
        <tr>
          <td>{{ $r['id'] }}</td>
          <td>{{ $r['route'] }}</td>
          <td>{{ $r['dates'] }}</td>
          <td>{{ $r['employee'] ?? '-' }}</td>
          <td>{{ strtoupper($r['approval_status'] ?? $r['status'] ?? '-') }}</td>
          <td class="right" style="white-space: nowrap;">
            <span class="money-nowrap">R$&nbsp;{{ number_format((float)$r['active_entries'],2,',','.') }}</span>
          </td>
          <td class="right" style="white-space: nowrap;">
            <span class="money-nowrap">R$&nbsp;{{ number_format((float)$r['active_expenses'],2,',','.') }}</span>
          </td>
          <td class="right" style="white-space: nowrap;">
            <span class="money-nowrap">R$&nbsp;{{ number_format((float)$r['balance'],2,',','.') }}</span>
          </td>
          <td class="right" style="white-space: nowrap;">
            <span class="money-nowrap">R$&nbsp;{{ number_format((float)($r['billing_material_amount'] ?? 0),2,',','.') }}</span>
          </td>
        </tr>
      @empty
        <tr><td colspan="9" class="muted">Nenhum registro.</td></tr>
      @endforelse
    </tbody>
  </table>

  <div class="hr"></div>
  <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
    <div><strong>Total Entradas:</strong> <span class="money-nowrap">R$&nbsp;{{ number_format($sumEntries,2,',','.') }}</span></div>
    <div><strong>Total Despesas:</strong> <span class="money-nowrap">R$&nbsp;{{ number_format($sumExpenses,2,',','.') }}</span></div>
    <div><strong>Saldo Total:</strong> <span class="money-nowrap">R$&nbsp;{{ number_format($sumBalance,2,',','.') }}</span></div>
    <div><strong>Faturar depois:</strong> <span class="money-nowrap">R$&nbsp;{{ number_format($sumBilling,2,',','.') }}</span></div>
  </div>
</div>

</body>
</html>