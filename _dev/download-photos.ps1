# 批量下载飞书文档中的实拍照片到 site/photos/{国家}/
$map = @{
  'kz' = @('PsMab7anEo10kJx7sNacdR3Dnkf','DKYybwyKroDxW1xcavwcsSzonzc','Y1U0bHJuWo1LbJxTwh6cAxyDnug','DBOKbzUn6odeKqxlIL5cjscRnTe','Glr7baBxkotMhsxerJiclVQ5nLc','MPZlbNoXJosi6XxoggzcfRwBnub')
  'ge' = @('MTv7bVdExoPvoCxDGo4cBQTcnQc','QrKvbrQruo2Hfexd1FGcuFD6nIh','CLHZbNtecoGZCzxOuLucYOMlnXd','IwkubKNt1oBrMCxx82uc7xGinRg','MVn5bKC56omPoAxGlvgce2l7nih','Z0pMbLaDJodvpTxsnwLclonbnKe','HMBab0AuhoPNIIxni7rcckMtnxh')
  'am' = @('T1MxbybPhoR402xzgOpcw3nRnll','TmnUbjZztoJR4kx4VspckSFMnuc','KOz2beFdFoRdoWxTi40cQcPunnh','KHMpbVlTMosQETxq4JMc2UO8nre','FciLbUMTBoJ8b8xkcmgcfQTsnsf')
  'tr' = @('N3VlblWMUoOkqOxmzo4c3dDLnFh','CLChbgJRWoYWEcxx36jcXdmKnCS','FbI6bPWPSoynT1xOyuwclzRan2c','UfN0bhovkoKdh6xseI3c5k7lnMg','EjpMb29Mkoay7kxMKjrcb8LrniQ','SKZvbqBTIopDHGxnLDUcgRjjnFf','CIEfblFo1o7A5TxrSpRc8vtanNe')
  'eg' = @('TIMfbwBQnosh06xT0PpcAnS8nCc','Q01gbCrWYoQnMnxcAe0cfhVznQg','SV1WbUqWgoF7j0xtktVc6xX7nod','VaSqb6euWo0mhNxF35DcJLCUnVf','N7CnbRAcToHerJxYD9Dc19wknhh','XwJlbqjk6oAFDUx3LeGchfYKnng')
  'ae' = @('MceJb42BHoZIuOxMEllcsocEngb','IdjfbmZ9ro0r8IxCl6wcKElHnpc','Tb50bZUZKof5JjxjmLOcEvmOnBb','IkiibesMaoKms4x1YcRciX0Cncf')
}
foreach ($country in $map.Keys) {
  $dir = "D:\亚欧非大环线\site\photos\$country"
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $i = 1
  foreach ($tok in $map[$country]) {
    $out = "$dir\img$i"
    $r = lark-cli docs +media-download --token $tok --output $out --as user 2>&1 | Out-String
    if ($r -match '"ok": ?true' -or $r -match '"ok": true') {
      Write-Output "OK   $country img$i <- $tok"
    } else {
      Write-Output "FAIL $country img$i <- $tok :: $($r.Substring(0, [Math]::Min(160, $r.Length)))"
    }
    $i++
  }
}
Get-ChildItem -Recurse "D:\亚欧非大环线\site\photos" | Select-Object FullName, Length
