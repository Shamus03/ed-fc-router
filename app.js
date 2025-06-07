function starDistance({ StarPos: [x1, y1, z1] }, { StarPos: [x2, y2, z2] }) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2)
}

function calculateCarrierRoute(navRoute) {
    const stops = navRoute.Route.slice()

    const route = []

    let currentStop = stops.shift()
    while (stops.length) {
        let longestJump = stops.shift()
        while (stops.length && starDistance(currentStop, stops[0]) <= 500) {
            longestJump = stops.shift()
        }

        route.push({ stop: longestJump, distance: starDistance(currentStop, longestJump) })
        currentStop = longestJump
    }

    return route
}

// const route = calculateCarrierRoute(NavRoute)
// console.log('System Name,X,Y,Z')
// console.log(route.map(s => [
//     s.stop.StarSystem,
//     ...s.stop.StarPos,
// ].join(',')).join('\n'))

filepicker.onchange = () => {
    const r = new FileReader()
    r.onload = e => {
        const navRoute = JSON.parse(e.target.result)
        const route = calculateCarrierRoute(navRoute)
        routeTableBody.innerHTML = ''
        for (const { stop, distance } of route) {
            const row = routeRowTemplate.content.cloneNode(true).children[0]
            let i = 0
            row.children[i++].textContent = stop.StarSystem
            row.children[i++].textContent = distance.toLocaleString()
            row.children[i++].textContent = stop.StarClass
            row.children[i++].textContent = stop.StarPos[0].toLocaleString()
            row.children[i++].textContent = stop.StarPos[1].toLocaleString()
            row.children[i++].textContent = stop.StarPos[2].toLocaleString()
            routeTableBody.appendChild(row)
        }
        const totalDistance = starDistance(route[0].stop, route[route.length - 1].stop)
        const totalJumpDistance = route.map(r => r.distance).reduce((a, b) => a + b)
        const efficiency = totalDistance / totalJumpDistance
        output.textContent = `Total Distance: ${totalDistance.toLocaleString()} ly
Total Jump Distance: ${totalJumpDistance.toLocaleString()} ly
Efficiency: ${efficiency.toLocaleString(undefined, { style: 'percent' })}`
        copyButton.style.display = ''
    };
    r.readAsText(filepicker.files[0])
}

copyButton.onclick = () => {
    const content = [...routeTable.querySelectorAll('tr')]
        .map(tr => [...tr.querySelectorAll('td,th')].map(td => td.textContent).join('\t'))
        .join('\n')
    navigator.clipboard.writeText(content)
    copyButton.innerText = 'Copied!'
}
