// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "MayaTravelAgent",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "MayaTravelAgent",
            targets: ["MayaTravelAgent"])
    ],
    dependencies: [
        // Add your dependencies here
        // .package(url: "https://github.com/Alamofire/Alamofire.git", .upToNextMajor(from: "5.0")),
    ],
    targets: [
        .target(
            name: "MayaTravelAgent",
            dependencies: [],
            path: ".",
            exclude: [
                "MayaTravelAgent.xcodeproj",
                "MayaTravelAgent.xcworkspace",
                "MayaTravelAgentTests",
                "MayaTravelAgentUITests"
            ]
        ),
        .testTarget(
            name: "MayaTravelAgentTests",
            dependencies: ["MayaTravelAgent"],
            path: "MayaTravelAgentTests"
        )
    ],
    swiftLanguageVersions: [.v5]
)